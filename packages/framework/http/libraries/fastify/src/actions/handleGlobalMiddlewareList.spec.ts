import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

import { type FastifyReply, type FastifyRequest } from 'fastify';

import { handleGlobalMiddlewareList } from './handleGlobalMiddlewareList.js';

describe(handleGlobalMiddlewareList, () => {
  describe('having no middleware handlers', () => {
    let requestFixture: FastifyRequest;
    let responseFixture: FastifyReply;

    beforeAll(() => {
      requestFixture = Symbol() as unknown as FastifyRequest;
      responseFixture = Symbol() as unknown as FastifyReply;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        try {
          await handleGlobalMiddlewareList([])(requestFixture, responseFixture);
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
    let requestFixture: FastifyRequest;
    let responseMock: Mocked<FastifyReply>;
    let firstMiddlewareHandlerMock: Mock<
      (request: unknown, response: unknown, next: () => void) => Promise<void>
    >;
    let secondMiddlewareHandlerMock: Mock<
      (request: unknown, response: unknown, next: () => void) => Promise<void>
    >;

    beforeAll(() => {
      requestFixture = Symbol() as unknown as FastifyRequest;
      responseMock = {
        callNotFound: vitest.fn(),
        sent: false,
      } as Partial<Mocked<FastifyReply>> as Mocked<FastifyReply>;

      firstMiddlewareHandlerMock = vitest.fn();
      secondMiddlewareHandlerMock = vitest.fn();
    });

    describe('when called, and first middleware does not call next()', () => {
      beforeAll(async () => {
        responseMock.sent = false;
        firstMiddlewareHandlerMock.mockResolvedValueOnce(undefined);

        await handleGlobalMiddlewareList([
          firstMiddlewareHandlerMock,
          secondMiddlewareHandlerMock,
        ])(requestFixture, responseMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call first middleware handler', () => {
        expect(firstMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseMock,
          expect.any(Function),
        );
      });

      it('should not call second middleware handler', () => {
        expect(secondMiddlewareHandlerMock).not.toHaveBeenCalled();
      });

      it('should call response.callNotFound()', () => {
        expect(responseMock.callNotFound).toHaveBeenCalledExactlyOnceWith();
      });
    });

    describe('when called, and first middleware does not call next(), and response is already sent', () => {
      beforeAll(async () => {
        responseMock.sent = true;
        firstMiddlewareHandlerMock.mockResolvedValueOnce(undefined);

        await handleGlobalMiddlewareList([
          firstMiddlewareHandlerMock,
          secondMiddlewareHandlerMock,
        ])(requestFixture, responseMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
        responseMock.sent = false;
      });

      it('should call first middleware handler', () => {
        expect(firstMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseMock,
          expect.any(Function),
        );
      });

      it('should not call second middleware handler', () => {
        expect(secondMiddlewareHandlerMock).not.toHaveBeenCalled();
      });

      it('should not call response.callNotFound()', () => {
        expect(responseMock.callNotFound).not.toHaveBeenCalled();
      });
    });

    describe('when called, and first middleware calls next()', () => {
      beforeAll(async () => {
        responseMock.sent = false;

        firstMiddlewareHandlerMock.mockImplementationOnce(
          async (_request: unknown, _response: unknown, next: () => void) => {
            next();
          },
        );

        secondMiddlewareHandlerMock.mockResolvedValueOnce(undefined);

        await handleGlobalMiddlewareList([
          firstMiddlewareHandlerMock,
          secondMiddlewareHandlerMock,
        ])(requestFixture, responseMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call first middleware handler', () => {
        expect(firstMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseMock,
          expect.any(Function),
        );
      });

      it('should call second middleware handler', () => {
        expect(secondMiddlewareHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseMock,
          expect.any(Function),
        );
      });

      it('should call response.callNotFound()', () => {
        expect(responseMock.callNotFound).toHaveBeenCalledExactlyOnceWith();
      });
    });
  });
});
