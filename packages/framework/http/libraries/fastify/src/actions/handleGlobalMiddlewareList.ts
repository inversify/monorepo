import { type MiddlewareHandler } from '@inversifyjs/http-core';
import { type FastifyReply, type FastifyRequest } from 'fastify';

type FastifyMiddlewareHandler = MiddlewareHandler<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
>;

export function handleGlobalMiddlewareList(
  orderedHandlers: FastifyMiddlewareHandler[],
): (request: FastifyRequest, response: FastifyReply) => Promise<void> {
  return async (
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<void> => {
    let currentIndex: number = 0;
    let [currentHandler]: FastifyMiddlewareHandler[] = orderedHandlers;

    if (currentHandler === undefined) {
      throw new Error('No middleware handlers to process');
    }

    let nextCalled: boolean = false;

    const next: () => void = (): void => {
      nextCalled = true;
    };

    do {
      await currentHandler(request, response, next);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!nextCalled) {
        break;
      }

      nextCalled = false;

      currentHandler = orderedHandlers[++currentIndex];
    } while (currentHandler !== undefined);

    if (!response.sent) {
      response.callNotFound();
    }
  };
}
