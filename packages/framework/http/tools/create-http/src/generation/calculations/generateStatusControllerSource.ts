import { OpenApiSchemaBindingKind } from '../models/OpenApiSchemaBindingKind.js';
import { type StatusControllerSourceModel } from '../models/StatusControllerSourceModel.js';
import { printSourceImport } from './printSourceImport.js';

function printOpenApiImports(model: StatusControllerSourceModel): string {
  if (model.openApiSchemaBindingKind === OpenApiSchemaBindingKind.toSchema) {
    return `import {
  OasDescription,
  OasOperationId,
  OasResponse,
  OasSummary,
  OasTag,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api/v3Dot2';`;
  }

  return `import {
  OasDescription,
  OasOperationId,
  OasResponse,
  OasSummary,
  OasTag,
} from '@inversifyjs/http-open-api/v3Dot2';`;
}

function printStatusResponseDecorator(
  model: StatusControllerSourceModel,
): string {
  if (model.openApiSchemaBindingKind === OpenApiSchemaBindingKind.toSchema) {
    return `@OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(StatusV1),
      },
    },
    description: 'Service is healthy',
  }))`;
  }

  return `@OasResponse(HttpStatusCode.OK, {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/StatusV1',
        },
      },
    },
    description: 'Service is healthy',
  })`;
}

export function generateStatusControllerSource(
  model: StatusControllerSourceModel,
): string {
  return `import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';
${printOpenApiImports(model)}
import { inject } from 'inversify';

import { type Status } from '../../domain/models/Status.js';
import { StatusV1FromStatusBuilder } from '../builders/StatusV1FromStatusBuilder.js';
${printSourceImport(model.apiTypeImport)}

@Controller('/v1/status')
export class StatusController {
  readonly #statusV1FromStatusBuilder: StatusV1FromStatusBuilder;

  constructor(
    @inject(StatusV1FromStatusBuilder)
    statusV1FromStatusBuilder: StatusV1FromStatusBuilder,
  ) {
    this.#statusV1FromStatusBuilder = statusV1FromStatusBuilder;
  }

  @OasSummary('Get service status')
  @OasDescription('Returns the current health status of the service')
  @OasOperationId('getStatus')
  @OasTag('Status')
  ${printStatusResponseDecorator(model)}
  @Get()
  public async getStatus(): Promise<StatusV1> {
    const status: Status = {
      status: 'ok',
    };

    return this.#statusV1FromStatusBuilder.build(status);
  }
}
`;
}
