export interface TransportProviderConfig<TParams> {
  readonly params: TParams;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  readonly type: Function;
}
