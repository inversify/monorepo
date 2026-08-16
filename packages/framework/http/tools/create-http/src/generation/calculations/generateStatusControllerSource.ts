export function generateStatusControllerSource(): string {
  return `import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';
import {
  OasDescription,
  OasOperationId,
  OasResponse,
  OasSummary,
  OasTag,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api/v3Dot2';
import { inject } from 'inversify';

import { type Status } from '../../domain/models/Status.js';
import { StatusV1FromStatusBuilder } from '../builders/StatusV1FromStatusBuilder.js';
import { StatusV1 } from '../models/StatusV1.js';

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
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(StatusV1),
      },
    },
    description: 'Service is healthy',
  }))
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
