import { MiddlewareHandler } from '../../http/models/MiddlewareHandler';

const noop: () => void = (): void => undefined;

export function handleMiddlewareList<TRequest, TResponse, TResult>(
  orderedHandlers: MiddlewareHandler<
    TRequest,
    TResponse,
    () => void,
    TResult
  >[],
) {
  if (orderedHandlers.length === 1) {
    const [currentHandler]: [
      MiddlewareHandler<TRequest, TResponse, () => void, TResult>,
    ] = orderedHandlers as [
      MiddlewareHandler<TRequest, TResponse, () => void, TResult>,
    ];

    return async (request: TRequest, response: TResponse): Promise<TResult> => {
      return currentHandler(request, response, noop);
    };
  }

  return async (request: TRequest, response: TResponse): Promise<TResult> => {
    let currentIndex: number = 0;
    let [currentHandler]: MiddlewareHandler<
      TRequest,
      TResponse,
      () => void,
      TResult
    >[] = orderedHandlers;

    if (currentHandler === undefined) {
      throw new Error('No middleware handlers to process');
    }

    let nextCalled: boolean = false;

    const next: () => void = (): void => {
      nextCalled = true;
    };

    let result: TResult;

    do {
      result = await currentHandler(request, response, next);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!nextCalled) {
        break;
      }

      nextCalled = false;

      currentHandler = orderedHandlers[++currentIndex];
    } while (currentHandler !== undefined);

    return result;
  };
}
