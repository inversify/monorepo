type ExecutionsFindQuerySort = 'startedAtAsc' | 'startedAtDesc';

export interface BaseExecutionsFilterQuery {
  readonly id: string | undefined;
  readonly request: {
    readonly method: string | undefined;
    readonly urlLike: string | undefined;
  };
  readonly sort: ExecutionsFindQuerySort | undefined;
}

export interface CompletedExecutionsFilterQuery extends BaseExecutionsFilterQuery {
  readonly response: {
    readonly statusCode: number | undefined;
  };
}

export interface OngoingExecutionsFilterQuery extends BaseExecutionsFilterQuery {
  readonly response: null;
}

export type ExecutionsFilterQuery =
  CompletedExecutionsFilterQuery | OngoingExecutionsFilterQuery;
