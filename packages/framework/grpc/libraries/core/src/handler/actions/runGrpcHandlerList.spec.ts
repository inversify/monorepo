import { beforeAll, describe, expect, it } from 'vitest';

import { type GrpcChainHandler } from '../models/GrpcChainHandler.js';
import { type GrpcHandlerListResult } from '../models/GrpcHandlerListResult.js';
import { runGrpcHandlerList } from './runGrpcHandlerList.js';

describe(runGrpcHandlerList, () => {
  describe('having no handlers', () => {
    describe('when called', () => {
      let resultFixture: GrpcHandlerListResult<string>;

      beforeAll(async () => {
        resultFixture = await runGrpcHandlerList<unknown, unknown, string>([])(
          undefined,
          undefined,
        );
      });

      it('should complete without a result', () => {
        expect(resultFixture).toStrictEqual({
          completed: true,
          result: undefined,
        });
      });
    });
  });

  describe('having a handler that does not call next', () => {
    describe('when called', () => {
      let resultFixture: GrpcHandlerListResult<string>;
      let secondCalledFixture: boolean;

      beforeAll(async () => {
        secondCalledFixture = false;

        const handlers: GrpcChainHandler<unknown, unknown, string>[] = [
          async (
            _request: unknown,
            _response: unknown,
            _next: () => void,
          ): Promise<string> => 'stopped',
          async (
            _request: unknown,
            _response: unknown,
            _next: () => void,
          ): Promise<string> => {
            secondCalledFixture = true;

            return 'second';
          },
        ];

        resultFixture = await runGrpcHandlerList(handlers)(
          undefined,
          undefined,
        );
      });

      it('should return that handler result', () => {
        expect(resultFixture).toStrictEqual({
          completed: false,
          result: 'stopped',
        });
      });

      it('should not call the next handler', () => {
        expect(secondCalledFixture).toBe(false);
      });
    });
  });

  describe('having handlers that call next', () => {
    describe('when called', () => {
      let resultFixture: GrpcHandlerListResult<string>;

      beforeAll(async () => {
        const handlers: GrpcChainHandler<unknown, unknown, string>[] = [
          async (
            _request: unknown,
            _response: unknown,
            next: () => void,
          ): Promise<string> => {
            next();

            return 'first';
          },
          async (
            _request: unknown,
            _response: unknown,
            next: () => void,
          ): Promise<string> => {
            next();

            return 'second';
          },
        ];

        resultFixture = await runGrpcHandlerList(handlers)(
          undefined,
          undefined,
        );
      });

      it('should complete with the last handler result', () => {
        expect(resultFixture).toStrictEqual({
          completed: true,
          result: 'second',
        });
      });
    });
  });
});
