import { Controller, Get, Query, UseErrorFilter } from '@inversifyjs/http-core';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { ValidateStandardSchemaV1 } from '@inversifyjs/standard-schema-validation';
import { inject } from 'inversify';

import { standardSchemaValidationPipe } from '../../../../foundation/inversify/pipes/standardSchemaValidationPipe.js';
import { InsightsManagementInputPort } from '../../../application/ports/InsightsManagementInputPort.js';
import { InsightsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/InsightsFindQueryFromGetInsightsV1QueryBuilder.js';
import {
  GetInsightsV1Query,
  getInsightsV1Query,
} from '../../zod/schemas/GetInsightsV1Query.js';

@Controller('.inversify/v1/insights')
@UseErrorFilter(InversifyValidationErrorFilter)
export class InsightsController {
  readonly #insightsFindQueryFromGetInsightsV1QueryBuilder: InsightsFindQueryFromGetInsightsV1QueryBuilder;
  readonly #insightsManagementInputPort: InsightsManagementInputPort;

  constructor(
    @inject(InsightsFindQueryFromGetInsightsV1QueryBuilder)
    insightsFindQueryFromGetInsightsV1QueryBuilder: InsightsFindQueryFromGetInsightsV1QueryBuilder,
    @inject(InsightsManagementInputPort)
    insightsManagementInputPort: InsightsManagementInputPort,
  ) {
    this.#insightsFindQueryFromGetInsightsV1QueryBuilder =
      insightsFindQueryFromGetInsightsV1QueryBuilder;
    this.#insightsManagementInputPort = insightsManagementInputPort;
  }

  @Get()
  public async getInsights(
    @Query(standardSchemaValidationPipe)
    @ValidateStandardSchemaV1(getInsightsV1Query)
    query: GetInsightsV1Query,
  ) {
    return this.#insightsManagementInputPort.find(
      this.#insightsFindQueryFromGetInsightsV1QueryBuilder.build(query),
    );
  }
}
