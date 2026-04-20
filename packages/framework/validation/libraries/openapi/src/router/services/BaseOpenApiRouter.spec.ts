import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/buildRouterNode.js'));
vitest.mock(import('../calculations/findRoute.js'));

import { buildRouterNode } from '../calculations/buildRouterNode.js';
import { findRoute } from '../calculations/findRoute.js';
import { type RouterNode } from '../models/RouterNode.js';
import { BaseOpenApiRouter } from './BaseOpenApiRouter.js';

describe(BaseOpenApiRouter, () => {
  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('when constructed', () => {
    let routerNodeFixture: RouterNode;

    beforeAll(() => {
      routerNodeFixture = {
        children: undefined,
        path: undefined,
      };

      vitest.mocked(buildRouterNode).mockReturnValue(routerNodeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    describe('having a single method with routes', () => {
      let router: BaseOpenApiRouter<unknown>;

      beforeAll(() => {
        router = new BaseOpenApiRouter(Symbol(), () => ({
          get: ['/users', '/users/{userId}'],
        }));
      });

      it('should call buildRouterNode once', () => {
        expect(buildRouterNode).toHaveBeenCalledExactlyOnceWith([
          '/users',
          '/users/{userId}',
        ]);
      });

      describe('.findRoute', () => {
        describe('when called with a known method', () => {
          let result: unknown;

          beforeAll(() => {
            vitest.mocked(findRoute).mockReturnValueOnce('/users/{userId}');

            result = router.findRoute('get', '/users/123');
          });

          afterAll(() => {
            vitest.clearAllMocks();
          });

          it('should call findRoute with the router node and path', () => {
            expect(findRoute).toHaveBeenCalledExactlyOnceWith(
              routerNodeFixture,
              '/users/123',
            );
          });

          it('should return the matched route', () => {
            expect(result).toBe('/users/{userId}');
          });
        });

        describe('when called with an unknown method', () => {
          let result: unknown;

          beforeAll(() => {
            result = router.findRoute('post', '/users');
          });

          it('should return undefined', () => {
            expect(result).toBeUndefined();
          });
        });
      });
    });

    describe('having multiple methods with routes', () => {
      beforeAll(() => {
        vitest.mocked(buildRouterNode).mockClear();

        new BaseOpenApiRouter(Symbol(), () => ({
          get: ['/users'],
          post: ['/users'],
        }));
      });

      it('should call buildRouterNode for each method', () => {
        expect(buildRouterNode).toHaveBeenCalledTimes(2);
      });
    });
  });
});
