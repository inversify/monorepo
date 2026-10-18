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
import { type Execution } from '../../../domain/models/Execution.js';
import { PrismaExecutionWithRelationsFixtures } from '../fixtures/PrismaExecutionWithRelationsFixtures.js';
import { type ControllerFromPrismaControllerBuilder } from './ControllerFromPrismaControllerBuilder.js';
import {
  ExecutionFromPrismaExecutionBuilder,
  type PrismaExecutionWithRelations,
} from './ExecutionFromPrismaExecutionBuilder.js';
import { type GuardFromPrismaGuardBuilder } from './GuardFromPrismaGuardBuilder.js';
import { type HttpErrorFromPrismaHttpErrorBuilder } from './HttpErrorFromPrismaHttpErrorBuilder.js';
import { type InterceptorFromPrismaInterceptorBuilder } from './InterceptorFromPrismaInterceptorBuilder.js';
import { type MiddlewareFromPrismaMiddlewareBuilder } from './MiddlewareFromPrismaMiddlewareBuilder.js';
import { type NativeMiddlewareFromPrismaNativeMiddlewareBuilder } from './NativeMiddlewareFromPrismaNativeMiddlewareBuilder.js';
import { type PipeFromPrismaPipeBuilder } from './PipeFromPrismaPipeBuilder.js';
import { type RequestFromPrismaRequestBuilder } from './RequestFromPrismaRequestBuilder.js';
import { type ResponseFromPrismaResponseBuilder } from './ResponseFromPrismaResponseBuilder.js';

describe(ExecutionFromPrismaExecutionBuilder, () => {
  let controllerFromPrismaControllerBuilderMock: Mocked<ControllerFromPrismaControllerBuilder>;
  let guardFromPrismaGuardBuilderMock: Mocked<GuardFromPrismaGuardBuilder>;
  let httpErrorFromPrismaHttpErrorBuilderMock: Mocked<HttpErrorFromPrismaHttpErrorBuilder>;
  let interceptorFromPrismaInterceptorBuilderMock: Mocked<InterceptorFromPrismaInterceptorBuilder>;
  let middlewareFromPrismaMiddlewareBuilderMock: Mocked<MiddlewareFromPrismaMiddlewareBuilder>;
  let nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock: Mocked<NativeMiddlewareFromPrismaNativeMiddlewareBuilder>;
  let pipeFromPrismaPipeBuilderMock: Mocked<PipeFromPrismaPipeBuilder>;
  let requestFromPrismaRequestBuilderMock: Mocked<RequestFromPrismaRequestBuilder>;
  let responseFromPrismaResponseBuilderMock: Mocked<ResponseFromPrismaResponseBuilder>;

  let executionFromPrismaExecutionBuilder: ExecutionFromPrismaExecutionBuilder;

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

    executionFromPrismaExecutionBuilder =
      new ExecutionFromPrismaExecutionBuilder(
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
    describe('having a prisma execution with every relation', () => {
      let prismaExecutionFixture: PrismaExecutionWithRelations;

      beforeAll(() => {
        prismaExecutionFixture = PrismaExecutionWithRelationsFixtures.any;
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

          result = executionFromPrismaExecutionBuilder.build(
            prismaExecutionFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call controllerFromPrismaControllerBuilder.build()', () => {
          expect(
            controllerFromPrismaControllerBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture.controller);
        });

        it('should call guardFromPrismaGuardBuilder.build()', () => {
          expect(
            guardFromPrismaGuardBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture.guards[0]);
        });

        it('should call httpErrorFromPrismaHttpErrorBuilder.build()', () => {
          expect(
            httpErrorFromPrismaHttpErrorBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(
            prismaExecutionFixture.httpErrors[0],
          );
        });

        it('should call interceptorFromPrismaInterceptorBuilder.build()', () => {
          expect(
            interceptorFromPrismaInterceptorBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(
            prismaExecutionFixture.interceptors[0],
          );
        });

        it('should call middlewareFromPrismaMiddlewareBuilder.build()', () => {
          expect(
            middlewareFromPrismaMiddlewareBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(
            prismaExecutionFixture.middlewares[0],
          );
        });

        it('should call nativeMiddlewareFromPrismaNativeMiddlewareBuilder.build()', () => {
          expect(
            nativeMiddlewareFromPrismaNativeMiddlewareBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(
            prismaExecutionFixture.nativeMiddlewares[0],
          );
        });

        it('should call pipeFromPrismaPipeBuilder.build()', () => {
          expect(
            pipeFromPrismaPipeBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture.pipes[0]);
        });

        it('should call requestFromPrismaRequestBuilder.build()', () => {
          expect(
            requestFromPrismaRequestBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture.request);
        });

        it('should call responseFromPrismaResponseBuilder.build()', () => {
          expect(
            responseFromPrismaResponseBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture.response);
        });

        it('should return an Execution', () => {
          const expected: Execution = {
            controller: ControllerFixtures.any,
            guards: [GuardFixtures.any],
            httpErrors: [HttpErrorFixtures.any],
            id: prismaExecutionFixture.id,
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

    describe('having a prisma execution with a null controller', () => {
      let prismaExecutionFixture: PrismaExecutionWithRelations;

      beforeAll(() => {
        prismaExecutionFixture =
          PrismaExecutionWithRelationsFixtures.withNullController;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            executionFromPrismaExecutionBuilder.build(prismaExecutionFixture);
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
              `Execution "${prismaExecutionFixture.id}" is missing its "controller" relation.`,
            ),
          );
        });
      });
    });

    describe('having a prisma execution with a null request', () => {
      let prismaExecutionFixture: PrismaExecutionWithRelations;

      beforeAll(() => {
        prismaExecutionFixture =
          PrismaExecutionWithRelationsFixtures.withNullRequest;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            executionFromPrismaExecutionBuilder.build(prismaExecutionFixture);
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
              `Execution "${prismaExecutionFixture.id}" is missing its "request" relation.`,
            ),
          );
        });
      });
    });

    describe('having a prisma execution with a null response', () => {
      let prismaExecutionFixture: PrismaExecutionWithRelations;

      beforeAll(() => {
        prismaExecutionFixture =
          PrismaExecutionWithRelationsFixtures.withNullResponse;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            executionFromPrismaExecutionBuilder.build(prismaExecutionFixture);
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
              `Execution "${prismaExecutionFixture.id}" is missing its "response" relation.`,
            ),
          );
        });
      });
    });
  });
});
