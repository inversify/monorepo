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
import { type CallsFindQueryResult } from '../../../application/models/CallsFindQueryResult.js';
import { CallManagementInputPort } from '../../../application/ports/CallManagementInputPort.js';
import { type Call } from '../../../domain/models/Call.js';
import { CallsFindQueryFromGetInsightsV1QueryBuilder } from '../../zod/builders/CallsFindQueryFromGetInsightsV1QueryBuilder.js';
import {
  type GetCallsV1Query,
  getCallsV1Query,
} from '../../zod/schemas/GetCallsV1Query.js';
import { CallsFindQueryFromCallIdBuilder } from '../builders/CallsFindQueryFromCallIdBuilder.js';

@Controller('.inversify/v1/calls')
@UseErrorFilter(InversifyValidationErrorFilter)
export class CallsController {
  readonly #callsFindQueryFromGetInsightsV1QueryBuilder: CallsFindQueryFromGetInsightsV1QueryBuilder;
  readonly #callsFindQueryFromCallIdBuilder: CallsFindQueryFromCallIdBuilder;
  readonly #callManagementInputPort: CallManagementInputPort;

  constructor(
    @inject(CallsFindQueryFromGetInsightsV1QueryBuilder)
    callsFindQueryFromGetInsightsV1QueryBuilder: CallsFindQueryFromGetInsightsV1QueryBuilder,
    @inject(CallsFindQueryFromCallIdBuilder)
    callsFindQueryFromCallIdBuilder: CallsFindQueryFromCallIdBuilder,
    @inject(CallManagementInputPort)
    callManagementInputPort: CallManagementInputPort,
  ) {
    this.#callsFindQueryFromGetInsightsV1QueryBuilder =
      callsFindQueryFromGetInsightsV1QueryBuilder;
    this.#callsFindQueryFromCallIdBuilder = callsFindQueryFromCallIdBuilder;
    this.#callManagementInputPort = callManagementInputPort;
  }

  @Get()
  public async getCalls(
    @Query(standardSchemaValidationPipe)
    @ValidateStandardSchemaV1(getCallsV1Query)
    query: GetCallsV1Query,
  ): Promise<CallsFindQueryResult> {
    return this.#callManagementInputPort.find(
      this.#callsFindQueryFromGetInsightsV1QueryBuilder.build(query),
    );
  }

  @Get('/:callId')
  public async getCall(
    @Params({
      name: 'callId',
    })
    callId: string,
  ): Promise<Call | NotFoundHttpResponse> {
    const result: CallsFindQueryResult =
      await this.#callManagementInputPort.find(
        this.#callsFindQueryFromCallIdBuilder.build(callId),
      );

    const call: Call | undefined = result.items[0];

    if (call === undefined) {
      return new NotFoundHttpResponse();
    }

    return call;
  }
}
