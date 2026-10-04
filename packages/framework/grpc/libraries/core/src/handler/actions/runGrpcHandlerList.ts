import { type GrpcChainHandler } from '../models/GrpcChainHandler.js';
import { type GrpcHandlerListResult } from '../models/GrpcHandlerListResult.js';

export function runGrpcHandlerList<TRequest, TResponse, TResult>(
  orderedHandlers: readonly GrpcChainHandler<TRequest, TResponse, TResult>[],
): (
  request: TRequest,
  response: TResponse,
) => Promise<GrpcHandlerListResult<TResult>> {
  return async (
    request: TRequest,
    response: TResponse,
  ): Promise<GrpcHandlerListResult<TResult>> => {
    if (orderedHandlers.length === 0) {
      return {
        completed: true,
        result: undefined,
      };
    }

    let completed: boolean = true;
    let result: TResult | undefined;

    for (const handler of orderedHandlers) {
      let nextCalled: boolean = false;

      const next: () => void = (): void => {
        nextCalled = true;
      };

      result = await handler(request, response, next);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!nextCalled) {
        completed = false;

        break;
      }
    }

    return {
      completed,
      result,
    };
  };
}
