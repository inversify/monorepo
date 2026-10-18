import { Controller, Get, Query, UseErrorFilter } from '@inversifyjs/http-core';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { ValidateStandardSchemaV1 } from '@inversifyjs/standard-schema-validation';
import { inject } from 'inversify';

import { standardSchemaValidationPipe } from '../../../../foundation/inversify/pipes/standardSchemaValidationPipe.js';
import { ExecutionsFindQueryResult } from '../../../application/models/ExecutionsFindQueryResult.js';
import { ExecutionManagementInputPort } from '../../../application/ports/ExecutionManagementInputPort.js';
import { ExecutionsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/ExecutionsFindQueryFromGetInsightsV1QueryBuilder.js';
import {
  GetInsightsV1Query,
  getInsightsV1Query,
} from '../../zod/schemas/GetInsightsV1Query.js';

@Controller('.inversify/v1/executions')
@UseErrorFilter(InversifyValidationErrorFilter)
export class ExecutionController {
  readonly #executionsFindQueryFromGetInsightsV1QueryBuilder: ExecutionsFindQueryFromGetInsightsV1QueryBuilder;
  readonly #executionManagementInputPort: ExecutionManagementInputPort;

  constructor(
    @inject(ExecutionsFindQueryFromGetInsightsV1QueryBuilder)
    executionsFindQueryFromGetInsightsV1QueryBuilder: ExecutionsFindQueryFromGetInsightsV1QueryBuilder,
    @inject(ExecutionManagementInputPort)
    executionManagementInputPort: ExecutionManagementInputPort,
  ) {
    this.#executionsFindQueryFromGetInsightsV1QueryBuilder =
      executionsFindQueryFromGetInsightsV1QueryBuilder;
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
}
