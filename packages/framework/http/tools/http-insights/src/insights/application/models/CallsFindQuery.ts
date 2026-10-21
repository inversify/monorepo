import {
  type CompletedCallsFilterQuery,
  type OngoingCallsFilterQuery,
} from './CallsFilterQuery.js';

interface BaseCallsFindQuery {
  readonly limit: number | undefined;
  readonly offset: number | undefined;
}

export interface CompletedCallsFindQuery extends BaseCallsFindQuery {
  readonly filter: CompletedCallsFilterQuery;
}

export interface OngoingCallsFindQuery extends BaseCallsFindQuery {
  readonly filter: OngoingCallsFilterQuery;
}

export type CallsFindQuery = CompletedCallsFindQuery | OngoingCallsFindQuery;
