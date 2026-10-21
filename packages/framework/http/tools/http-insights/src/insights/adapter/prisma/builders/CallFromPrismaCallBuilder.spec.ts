import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { ControllerFixtures } from '../../../domain/fixtures/ControllerFixtures.js';
import { GuardFixtures } from '../../../domain/fixtures/GuardFixtures.js';
import { HttpErrorFixtures } from '../../../domain/fixtures/HttpErrorFixtures.js';
import { InterceptorFixtures } from '../../../domain/fixtures/InterceptorFixtures.js';
import { MiddlewareFixtures } from '../../../domain/fixtures/MiddlewareFixtures.js';
import { NativeMiddlewareFixtures } from '../../../domain/fixtures/NativeMiddlewareFixtures.js';
import { PipeFixtures } from '../../../domain/fixtures/PipeFixtures.js';
import { RequestFixtures } from '../../../domain/fixtures/RequestFixtures.js';
import { ResponseFixtures } from '../../../domain/fixtures/ResponseFixtures.js';
import { type Call } from '../../../domain/models/Call.js';
import { type OngoingCall } from '../../../domain/models/OngoingCall.js';
import { PrismaCallWithRelationsFixtures } from '../fixtures/PrismaCallWithRelationsFixtures.js';
import {
  CallFromPrismaCallBuilder,
  type PrismaCallWithRelations,
} from './CallFromPrismaCallBuilder.js';
import { type ControllerFromPrismaControllerBuilder } from './ControllerFromPrismaControllerBuilder.js';
import { type GuardFromPrismaGuardBuilder } from './GuardFromPrismaGuardBuilder.js';
import { type HttpErrorFromPrismaHttpErrorBuilder } from './HttpErrorFromPrismaHttpErrorBuilder.js';
import { type InterceptorFromPrismaInterceptorBuilder } from './InterceptorFromPrismaInterceptorBuilder.js';
import { type MiddlewareFromPrismaMiddlewareBuilder } from './MiddlewareFromPrismaMiddlewareBuilder.js';
import { type NativeMiddlewareFromPrismaNativeMiddlewareBuilder } from './NativeMiddlewareFromPrismaNativeMiddlewareBuilder.js';
import { type PipeFromPrismaPipeBuilder } from './PipeFromPrismaPipeBuilder.js';
import { type RequestFromPrismaRequestBuilder } from './RequestFromPrismaRequestBuilder.js';
import { type ResponseFromPrismaResponseBuilder } from './ResponseFromPrismaResponseBuilder.js';

describe(CallFromPrismaCallBuilder, () => {
  let controllerFromPrismaControllerBuilderMock: Mocked<ControllerFromPrismaControllerBuilder>;
  let guardFromPrismaGuardBuilderMock: Mocked<GuardFromPrismaGuardBuilder>;
  let httpErrorFromPrismaHttpErrorBuilderMock: Mocked<HttpErrorFromPrismaHttpErrorBuilder>;
  let interceptorFromPrismaInterceptorBuilderMock: Mocked<InterceptorFromPrismaInterceptorBuilder>;
  let middlewareFromPrismaMiddlewareBuilderMock: Mocked<MiddlewareFromPrismaMiddlewareBuilder>;
  let nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock: Mocked<NativeMiddlewareFromPrismaNativeMiddlewareBuilder>;
  let pipeFromPrismaPipeBuilderMock: Mocked<PipeFromPrismaPipeBuilder>;
  let requestFromPrismaRequestBuilderMock: Mocked<RequestFromPrismaRequestBuilder>;
  let responseFromPrismaResponseBuilderMock: Mocked<ResponseFromPrismaResponseBuilder>;

  let callFromPrismaCallBuilder: CallFromPrismaCallBuilder;

  beforeAll(() => {
    controllerFromPrismaControllerBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<ControllerFromPrismaControllerBuilder>
    > as Mocked<ControllerFromPrismaControllerBuilder>;
    guardFromPrismaGuardBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<GuardFromPrismaGuardBuilder>
    > as Mocked<GuardFromPrismaGuardBuilder>;
    httpErrorFromPrismaHttpErrorBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<HttpErrorFromPrismaHttpErrorBuilder>
    > as Mocked<HttpErrorFromPrismaHttpErrorBuilder>;
    interceptorFromPrismaInterceptorBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<InterceptorFromPrismaInterceptorBuilder>
    > as Mocked<InterceptorFromPrismaInterceptorBuilder>;
    middlewareFromPrismaMiddlewareBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<MiddlewareFromPrismaMiddlewareBuilder>
    > as Mocked<MiddlewareFromPrismaMiddlewareBuilder>;
    nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<NativeMiddlewareFromPrismaNativeMiddlewareBuilder>
    > as Mocked<NativeMiddlewareFromPrismaNativeMiddlewareBuilder>;
    pipeFromPrismaPipeBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<PipeFromPrismaPipeBuilder>
    > as Mocked<PipeFromPrismaPipeBuilder>;
    requestFromPrismaRequestBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<RequestFromPrismaRequestBuilder>
    > as Mocked<RequestFromPrismaRequestBuilder>;
    responseFromPrismaResponseBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<ResponseFromPrismaResponseBuilder>
    > as Mocked<ResponseFromPrismaResponseBuilder>;

    callFromPrismaCallBuilder = new CallFromPrismaCallBuilder(
      controllerFromPrismaControllerBuilderMock,
      guardFromPrismaGuardBuilderMock,
      httpErrorFromPrismaHttpErrorBuilderMock,
      interceptorFromPrismaInterceptorBuilderMock,
      middlewareFromPrismaMiddlewareBuilderMock,
      nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock,
      pipeFromPrismaPipeBuilderMock,
      requestFromPrismaRequestBuilderMock,
      responseFromPrismaResponseBuilderMock,
    );
  });

  describe('.build', () => {
    describe('having a prisma call with every relation', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.any;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          controllerFromPrismaControllerBuilderMock.build.mockReturnValueOnce(
            ControllerFixtures.any,
          );
          guardFromPrismaGuardBuilderMock.build.mockReturnValueOnce(
            GuardFixtures.any,
          );
          httpErrorFromPrismaHttpErrorBuilderMock.build.mockReturnValueOnce(
            HttpErrorFixtures.any,
          );
          interceptorFromPrismaInterceptorBuilderMock.build.mockReturnValueOnce(
            InterceptorFixtures.any,
          );
          middlewareFromPrismaMiddlewareBuilderMock.build.mockReturnValueOnce(
            MiddlewareFixtures.any,
          );
          nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock.build.mockReturnValueOnce(
            NativeMiddlewareFixtures.any,
          );
          pipeFromPrismaPipeBuilderMock.build.mockReturnValueOnce(
            PipeFixtures.any,
          );
          requestFromPrismaRequestBuilderMock.build.mockReturnValueOnce(
            RequestFixtures.any,
          );
          responseFromPrismaResponseBuilderMock.build.mockReturnValueOnce(
            ResponseFixtures.any,
          );

          result = callFromPrismaCallBuilder.build(prismaCallFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call controllerFromPrismaControllerBuilder.build()', () => {
          expect(
            controllerFromPrismaControllerBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.controller);
        });

        it('should call guardFromPrismaGuardBuilder.build()', () => {
          expect(
            guardFromPrismaGuardBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.guards[0]);
        });

        it('should call httpErrorFromPrismaHttpErrorBuilder.build()', () => {
          expect(
            httpErrorFromPrismaHttpErrorBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.httpErrors[0]);
        });

        it('should call interceptorFromPrismaInterceptorBuilder.build()', () => {
          expect(
            interceptorFromPrismaInterceptorBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.interceptors[0]);
        });

        it('should call middlewareFromPrismaMiddlewareBuilder.build()', () => {
          expect(
            middlewareFromPrismaMiddlewareBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.middlewares[0]);
        });

        it('should call nativeMiddlewareFromPrismaNativeMiddlewareBuilder.build()', () => {
          expect(
            nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(
            prismaCallFixture.nativeMiddlewares[0],
          );
        });

        it('should call pipeFromPrismaPipeBuilder.build()', () => {
          expect(
            pipeFromPrismaPipeBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.pipes[0]);
        });

        it('should call requestFromPrismaRequestBuilder.build()', () => {
          expect(
            requestFromPrismaRequestBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.request);
        });

        it('should call responseFromPrismaResponseBuilder.build()', () => {
          expect(
            responseFromPrismaResponseBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.response);
        });

        it('should return an Call', () => {
          const expected: Call = {
            controller: ControllerFixtures.any,
            guards: [GuardFixtures.any],
            httpErrors: [HttpErrorFixtures.any],
            id: prismaCallFixture.id,
            interceptors: [InterceptorFixtures.any],
            middlewares: [MiddlewareFixtures.any],
            nativeMiddlewares: [NativeMiddlewareFixtures.any],
            pipes: [PipeFixtures.any],
            request: RequestFixtures.any,
            response: ResponseFixtures.any,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a prisma call with a null controller', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.withNullController;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          guardFromPrismaGuardBuilderMock.build.mockReturnValueOnce(
            GuardFixtures.any,
          );
          httpErrorFromPrismaHttpErrorBuilderMock.build.mockReturnValueOnce(
            HttpErrorFixtures.any,
          );
          interceptorFromPrismaInterceptorBuilderMock.build.mockReturnValueOnce(
            InterceptorFixtures.any,
          );
          middlewareFromPrismaMiddlewareBuilderMock.build.mockReturnValueOnce(
            MiddlewareFixtures.any,
          );
          nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock.build.mockReturnValueOnce(
            NativeMiddlewareFixtures.any,
          );
          pipeFromPrismaPipeBuilderMock.build.mockReturnValueOnce(
            PipeFixtures.any,
          );
          requestFromPrismaRequestBuilderMock.build.mockReturnValueOnce(
            RequestFixtures.any,
          );
          responseFromPrismaResponseBuilderMock.build.mockReturnValueOnce(
            ResponseFixtures.any,
          );

          result = callFromPrismaCallBuilder.build(prismaCallFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call controllerFromPrismaControllerBuilder.build()', () => {
          expect(
            controllerFromPrismaControllerBuilderMock.build,
          ).not.toHaveBeenCalled();
        });

        it('should return an Call without a controller', () => {
          const expected: Call = {
            controller: undefined,
            guards: [GuardFixtures.any],
            httpErrors: [HttpErrorFixtures.any],
            id: prismaCallFixture.id,
            interceptors: [InterceptorFixtures.any],
            middlewares: [MiddlewareFixtures.any],
            nativeMiddlewares: [NativeMiddlewareFixtures.any],
            pipes: [PipeFixtures.any],
            request: RequestFixtures.any,
            response: ResponseFixtures.any,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a prisma call with a null request', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.withNullRequest;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            callFromPrismaCallBuilder.build(prismaCallFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              `Call "${prismaCallFixture.id}" is missing its "request" relation.`,
            ),
          );
        });
      });
    });

    describe('having a prisma call with a null response', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.withNullResponse;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            callFromPrismaCallBuilder.build(prismaCallFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              `Call "${prismaCallFixture.id}" is missing its "response" relation.`,
            ),
          );
        });
      });
    });
  });

  describe('.buildOngoing', () => {
    describe('having a prisma call with a controller and a null response', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.withNullResponse;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          controllerFromPrismaControllerBuilderMock.build.mockReturnValueOnce(
            ControllerFixtures.any,
          );
          guardFromPrismaGuardBuilderMock.build.mockReturnValueOnce(
            GuardFixtures.any,
          );
          httpErrorFromPrismaHttpErrorBuilderMock.build.mockReturnValueOnce(
            HttpErrorFixtures.any,
          );
          interceptorFromPrismaInterceptorBuilderMock.build.mockReturnValueOnce(
            InterceptorFixtures.any,
          );
          middlewareFromPrismaMiddlewareBuilderMock.build.mockReturnValueOnce(
            MiddlewareFixtures.any,
          );
          nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock.build.mockReturnValueOnce(
            NativeMiddlewareFixtures.any,
          );
          pipeFromPrismaPipeBuilderMock.build.mockReturnValueOnce(
            PipeFixtures.any,
          );
          requestFromPrismaRequestBuilderMock.build.mockReturnValueOnce(
            RequestFixtures.any,
          );

          result = callFromPrismaCallBuilder.buildOngoing(prismaCallFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call controllerFromPrismaControllerBuilder.build()', () => {
          expect(
            controllerFromPrismaControllerBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture.controller);
        });

        it('should not call responseFromPrismaResponseBuilder.build()', () => {
          expect(
            responseFromPrismaResponseBuilderMock.build,
          ).not.toHaveBeenCalled();
        });

        it('should return an OngoingCall', () => {
          const expected: OngoingCall = {
            controller: ControllerFixtures.any,
            guards: [GuardFixtures.any],
            httpErrors: [HttpErrorFixtures.any],
            id: prismaCallFixture.id,
            interceptors: [InterceptorFixtures.any],
            middlewares: [MiddlewareFixtures.any],
            nativeMiddlewares: [NativeMiddlewareFixtures.any],
            pipes: [PipeFixtures.any],
            request: RequestFixtures.any,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a prisma call with a null controller', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.withNullController;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          guardFromPrismaGuardBuilderMock.build.mockReturnValueOnce(
            GuardFixtures.any,
          );
          httpErrorFromPrismaHttpErrorBuilderMock.build.mockReturnValueOnce(
            HttpErrorFixtures.any,
          );
          interceptorFromPrismaInterceptorBuilderMock.build.mockReturnValueOnce(
            InterceptorFixtures.any,
          );
          middlewareFromPrismaMiddlewareBuilderMock.build.mockReturnValueOnce(
            MiddlewareFixtures.any,
          );
          nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock.build.mockReturnValueOnce(
            NativeMiddlewareFixtures.any,
          );
          pipeFromPrismaPipeBuilderMock.build.mockReturnValueOnce(
            PipeFixtures.any,
          );
          requestFromPrismaRequestBuilderMock.build.mockReturnValueOnce(
            RequestFixtures.any,
          );

          result = callFromPrismaCallBuilder.buildOngoing(prismaCallFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call controllerFromPrismaControllerBuilder.build()', () => {
          expect(
            controllerFromPrismaControllerBuilderMock.build,
          ).not.toHaveBeenCalled();
        });

        it('should return an OngoingCall', () => {
          const expected: OngoingCall = {
            controller: undefined,
            guards: [GuardFixtures.any],
            httpErrors: [HttpErrorFixtures.any],
            id: prismaCallFixture.id,
            interceptors: [InterceptorFixtures.any],
            middlewares: [MiddlewareFixtures.any],
            nativeMiddlewares: [NativeMiddlewareFixtures.any],
            pipes: [PipeFixtures.any],
            request: RequestFixtures.any,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a prisma call with a null request', () => {
      let prismaCallFixture: PrismaCallWithRelations;

      beforeAll(() => {
        prismaCallFixture = PrismaCallWithRelationsFixtures.withNullRequest;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            callFromPrismaCallBuilder.buildOngoing(prismaCallFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              `Call "${prismaCallFixture.id}" is missing its "request" relation.`,
            ),
          );
        });
      });
    });
  });
});
