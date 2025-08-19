// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Guard<TRequest = any> {
  activate(request: TRequest): Promise<boolean> | boolean;
}
