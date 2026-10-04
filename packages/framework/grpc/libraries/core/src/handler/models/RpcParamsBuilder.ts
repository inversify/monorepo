export type RpcParamsBuilder = (
  call: unknown,
  callback: unknown,
  response: unknown,
) => unknown[] | Promise<unknown[]>;
