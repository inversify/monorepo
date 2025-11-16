import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { handleMiddlewareList } from './handleMiddlewareList';

describe(handleMiddlewareList, () => {
  describe('having no middleware handlers', () => {
    let requestFixture: unknown;
    let responseFixture: unknown;

    beforeAll(() => {
      requestFixture = Symbol();
      responseFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        try {
          await handleMiddlewareList([])(requestFixture, responseFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<Error> = {
          message: 'No middleware handlers to process',
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having two middleware handlers', () => {
    let requestFixture: unknown;
    let responseFixture: unknown;
    let firstMiddlewareHandlerMock: Mock<
      (
        request: unknown,
        response: unknown,
        next: () => void,
      ) => Promise<unknown>
    >;
    let secondMiddlewareHandlerMock: Mock<
      (
        request: unknown,
        response: unknown,
        next: () => void,
      ) => Promise<unknown>
    >;

    beforeAll(() => {
      requestFixture = Symbol();
      responseFixture = Symbol();

      firstMiddlewareHandlerMock = vitest.fn();
      secondMiddlewareHandlerMock = vitest.fn();
    });

    describe('when called', () => {
      let firstMiddlewareHandlerResultFixture: unknown;

      let result: unknown;

      beforeAll(async () => {
        firstMiddlewareHandlerResultFixture = Symbol();

        firstMiddlewareHandlerMock.mockResolvedValueOnce(
          firstMiddlewareHandlerResultFixture,
        );

        result = await handleMiddlewareList([
          firstMiddlewareHandlerMock,
          secondMiddlewareHandlerMock,
        ])(requestFixture, responseFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call middlewareHandler()', () => {
        expect(firstMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should not call second middleware handler', () => {
        expect(secondMiddlewareHandlerMock).not.toHaveBeenCalled();
      });

      it('should return expected result', () => {
        expect(result).toBe(firstMiddlewareHandlerResultFixture);
      });
    });

    describe('when called, and first middleware calls next()', () => {
      let firstMiddlewareHandlerResultFixture: unknown;
      let secondMiddlewareHandlerResultFixture: unknown;

      let result: unknown;

      beforeAll(async () => {
        firstMiddlewareHandlerResultFixture = Symbol();
        secondMiddlewareHandlerResultFixture = Symbol();

        firstMiddlewareHandlerMock.mockImplementationOnce(
          async (_request: unknown, _response: unknown, next: () => void) => {
            next();

            return firstMiddlewareHandlerResultFixture;
          },
        );

        secondMiddlewareHandlerMock.mockResolvedValueOnce(
          secondMiddlewareHandlerResultFixture,
        );

        result = await handleMiddlewareList([
          firstMiddlewareHandlerMock,
          secondMiddlewareHandlerMock,
        ])(requestFixture, responseFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call middlewareHandler()', () => {
        expect(firstMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should call second middlewareHandler()', () => {
        expect(secondMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(secondMiddlewareHandlerResultFixture);
      });
    });
  });
});
