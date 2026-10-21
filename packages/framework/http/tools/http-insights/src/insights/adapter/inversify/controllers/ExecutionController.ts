import {
  Controller,
  Get,
  NotFoundHttpResponse,
  Params,
  Query,
  UseErrorFilter,
} from '@inversifyjs/http-core';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { ValidateStandardSchemaV1 } from '@inversifyjs/standard-schema-validation';
import { inject } from 'inversify';

import { standardSchemaValidationPipe } from '../../../../foundation/inversify/pipes/standardSchemaValidationPipe.js';
import { type ExecutionsFindQueryResult } from '../../../application/models/ExecutionsFindQueryResult.js';
import { ExecutionManagementInputPort } from '../../../application/ports/ExecutionManagementInputPort.js';
import { type Execution } from '../../../domain/models/Execution.js';
import { ExecutionsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/ExecutionsFindQueryFromGetInsightsV1QueryBuilder.js';
import {
  type GetInsightsV1Query,
  getInsightsV1Query,
} from '../../zod/schemas/GetInsightsV1Query.js';
import { ExecutionsFindQueryFromInsightsIdBuilder } from '../builders/ExecutionsFindQueryFromInsightsIdBuilder.js';

@Controller('.inversify/v1/executions')
@UseErrorFilter(InversifyValidationErrorFilter)
export class ExecutionController {
  readonly #executionsFindQueryFromGetInsightsV1QueryBuilder: ExecutionsFindQueryFromGetInsightsV1QueryBuilder;
  readonly #executionsFindQueryFromInsightsIdBuilder: ExecutionsFindQueryFromInsightsIdBuilder;
  readonly #executionManagementInputPort: ExecutionManagementInputPort;

  constructor(
    @inject(ExecutionsFindQueryFromGetInsightsV1QueryBuilder)
    executionsFindQueryFromGetInsightsV1QueryBuilder: ExecutionsFindQueryFromGetInsightsV1QueryBuilder,
    @inject(ExecutionsFindQueryFromInsightsIdBuilder)
    executionsFindQueryFromInsightsIdBuilder: ExecutionsFindQueryFromInsightsIdBuilder,
    @inject(ExecutionManagementInputPort)
    executionManagementInputPort: ExecutionManagementInputPort,
  ) {
    this.#executionsFindQueryFromGetInsightsV1QueryBuilder =
      executionsFindQueryFromGetInsightsV1QueryBuilder;
    this.#executionsFindQueryFromInsightsIdBuilder =
      executionsFindQueryFromInsightsIdBuilder;
    this.#executionManagementInputPort = executionManagementInputPort;
  }

  @Get()
  public async getExecutions(
    @Query(standardSchemaValidationPipe)
    @ValidateStandardSchemaV1(getInsightsV1Query)
    query: GetInsightsV1Query,
  ): Promise<ExecutionsFindQueryResult> {
    return this.#executionManagementInputPort.find(
      this.#executionsFindQueryFromGetInsightsV1QueryBuilder.build(query),
    );
  }

  @Get('/:executionId')
  public async getExecution(
    @Params({
      name: 'executionId',
    })
    executionId: string,
  ): Promise<Execution | NotFoundHttpResponse> {
    const result: ExecutionsFindQueryResult =
      await this.#executionManagementInputPort.find(
        this.#executionsFindQueryFromInsightsIdBuilder.build(executionId),
      );

    const execution: Execution | undefined = result.items[0];

    if (execution === undefined) {
      return new NotFoundHttpResponse();
    }

    return execution;
  }
}
