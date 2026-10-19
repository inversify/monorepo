import {
  type CompletedExecutionsFilterQuery,
  type OngoingExecutionsFilterQuery,
} from './ExecutionsFilterQuery.js';

interface BaseExecutionsFindQuery {
  readonly limit: number | undefined;
  readonly offset: number | undefined;
}

export interface CompletedExecutionsFindQuery extends BaseExecutionsFindQuery {
  readonly filter: CompletedExecutionsFilterQuery;
}

export interface OngoingExecutionsFindQuery extends BaseExecutionsFindQuery {
  readonly filter: OngoingExecutionsFilterQuery;
}

export type ExecutionsFindQuery =
  CompletedExecutionsFindQuery | OngoingExecutionsFindQuery;
