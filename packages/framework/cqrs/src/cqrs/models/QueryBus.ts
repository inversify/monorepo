export interface QueryBus {
  send<TResult = unknown>(query: object): Promise<TResult>;
}
