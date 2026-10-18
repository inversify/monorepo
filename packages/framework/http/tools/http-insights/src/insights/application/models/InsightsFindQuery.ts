export type InsightsFindQuerySort = 'startedAtAsc' | 'startedAtDesc';

export interface InsightsFindQuery {
  readonly limit: number | undefined;
  readonly offset: number | undefined;
  readonly request: {
    readonly method: string | undefined;
    readonly urlLike: string | undefined;
  };
  readonly response: {
    readonly statusCode: number | undefined;
  };
  readonly sort: InsightsFindQuerySort | undefined;
}
