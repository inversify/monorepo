type CallsFindQuerySort = 'startedAtAsc' | 'startedAtDesc';

export interface BaseCallsFilterQuery {
  readonly id: string | undefined;
  readonly request: {
    readonly method: string | undefined;
    readonly urlLike: string | undefined;
  };
  readonly sort: CallsFindQuerySort | undefined;
}

export interface CompletedCallsFilterQuery extends BaseCallsFilterQuery {
  readonly response: {
    readonly statusCode: number | undefined;
  };
}

export interface OngoingCallsFilterQuery extends BaseCallsFilterQuery {
  readonly response: null;
}

export type CallsFilterQuery =
  | CompletedCallsFilterQuery
  | OngoingCallsFilterQuery;
