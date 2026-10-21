import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type PrismaClient } from '../../../../generated/prisma/client.js';
import {
  type CompletedCallsFindQuery,
  type OngoingCallsFindQuery,
} from '../../../application/models/CallsFindQuery.js';
import { type ExecuteUpdateCommand } from '../../../application/models/ExecuteUpdateCommand.js';
import { CallFixtures } from '../../../domain/fixtures/CallFixtures.js';
import { ControllerFixtures } from '../../../domain/fixtures/ControllerFixtures.js';
import { GuardFixtures } from '../../../domain/fixtures/GuardFixtures.js';
import { HttpErrorFixtures } from '../../../domain/fixtures/HttpErrorFixtures.js';
import { RequestFixtures } from '../../../domain/fixtures/RequestFixtures.js';
import { ResponseFixtures } from '../../../domain/fixtures/ResponseFixtures.js';
import { type Call } from '../../../domain/models/Call.js';
import {
  type CallFromPrismaCallBuilder,
  callInclude,
  type PrismaCallWithRelations,
} from '../builders/CallFromPrismaCallBuilder.js';
import { PrismaCallWithRelationsFixtures } from '../fixtures/PrismaCallWithRelationsFixtures.js';
import { PrismaInsightsPersistenceAdapter } from './PrismaInsightsPersistenceAdapter.js';

const baseWhereFixture: unknown = {
  request: { isNot: null },
  response: { isNot: null },
};

const ongoingWhereFixture: unknown = {
  request: { isNot: null },
  response: { is: null },
};

describe(PrismaInsightsPersistenceAdapter, () => {
  let callFromPrismaCallBuilderMock: Mocked<CallFromPrismaCallBuilder>;
  let prismaClientMock: Mocked<PrismaClient>;
  let callCreateMock: ReturnType<typeof vitest.fn>;
  let callFindManyMock: ReturnType<typeof vitest.fn>;
  let transactionCallFindManyMock: ReturnType<typeof vitest.fn>;
  let callCountMock: ReturnType<typeof vitest.fn>;
  let controllerCreateManyMock: ReturnType<typeof vitest.fn>;
  let guardCreateManyMock: ReturnType<typeof vitest.fn>;
  let httpErrorCreateManyMock: ReturnType<typeof vitest.fn>;
  let interceptorCreateManyMock: ReturnType<typeof vitest.fn>;
  let middlewareCreateManyMock: ReturnType<typeof vitest.fn>;
  let nativeMiddlewareCreateManyMock: ReturnType<typeof vitest.fn>;
  let pipeCreateManyMock: ReturnType<typeof vitest.fn>;
  let responseCreateManyMock: ReturnType<typeof vitest.fn>;
  let prismaTransactionMock: ReturnType<typeof vitest.fn>;

  let prismaInsightsPersistenceAdapter: PrismaInsightsPersistenceAdapter;

  beforeAll(() => {
    callFromPrismaCallBuilderMock = {
      build: vitest.fn(),
      buildOngoing: vitest.fn(),
    } as Partial<
      Mocked<CallFromPrismaCallBuilder>
    > as Mocked<CallFromPrismaCallBuilder>;
    callCreateMock = vitest.fn();
    callFindManyMock = vitest.fn();
    transactionCallFindManyMock = vitest.fn();
    callCountMock = vitest.fn();
    controllerCreateManyMock = vitest.fn();
    guardCreateManyMock = vitest.fn();
    httpErrorCreateManyMock = vitest.fn();
    interceptorCreateManyMock = vitest.fn();
    middlewareCreateManyMock = vitest.fn();
    nativeMiddlewareCreateManyMock = vitest.fn();
    pipeCreateManyMock = vitest.fn();
    responseCreateManyMock = vitest.fn();
    const transactionClient: {
      controller: { createMany: ReturnType<typeof vitest.fn> };
      call: {
        create: ReturnType<typeof vitest.fn>;
        findMany: ReturnType<typeof vitest.fn>;
      };
      guard: { createMany: ReturnType<typeof vitest.fn> };
      httpError: { createMany: ReturnType<typeof vitest.fn> };
      interceptor: { createMany: ReturnType<typeof vitest.fn> };
      middleware: { createMany: ReturnType<typeof vitest.fn> };
      nativeMiddleware: { createMany: ReturnType<typeof vitest.fn> };
      pipe: { createMany: ReturnType<typeof vitest.fn> };
      response: { createMany: ReturnType<typeof vitest.fn> };
    } = {
      call: {
        create: callCreateMock,
        findMany: transactionCallFindManyMock,
      },
      controller: {
        createMany: controllerCreateManyMock,
      },
      guard: {
        createMany: guardCreateManyMock,
      },
      httpError: {
        createMany: httpErrorCreateManyMock,
      },
      interceptor: {
        createMany: interceptorCreateManyMock,
      },
      middleware: {
        createMany: middlewareCreateManyMock,
      },
      nativeMiddleware: {
        createMany: nativeMiddlewareCreateManyMock,
      },
      pipe: {
        createMany: pipeCreateManyMock,
      },
      response: {
        createMany: responseCreateManyMock,
      },
    };
    prismaTransactionMock = vitest.fn(
      async (
        callback: (transaction: typeof transactionClient) => Promise<void>,
      ): Promise<void> => {
        await callback(transactionClient);
      },
    );
    prismaClientMock = {
      $transaction: prismaTransactionMock,
      call: {
        count: callCountMock,
        create: callCreateMock,
        findMany: callFindManyMock,
      },
    } as unknown as Mocked<PrismaClient>;

    prismaInsightsPersistenceAdapter = new PrismaInsightsPersistenceAdapter(
      callFromPrismaCallBuilderMock,
      prismaClientMock,
    );
  });

  describe('.create', () => {
    describe('having a call whose errors are Error values', () => {
      let causeFixture: Error;
      let errorFixture: Error;
      let callFixture: Call;
      let serializedErrorFixture: {
        cause: {
          message: string;
          name: string;
          stack: string;
        };
        message: string;
        name: string;
        stack: string;
      };

      beforeAll(() => {
        causeFixture = new Error('root');
        causeFixture.stack = 'Error: root';
        errorFixture = new Error('boom', { cause: causeFixture });
        errorFixture.stack = 'Error: boom';
        serializedErrorFixture = {
          cause: {
            message: 'root',
            name: 'Error',
            stack: 'Error: root',
          },
          message: 'boom',
          name: 'Error',
          stack: 'Error: boom',
        };
        callFixture = {
          controller: {
            ...ControllerFixtures.any,
            error: errorFixture,
          },
          guards: [GuardFixtures.any],
          httpErrors: [
            {
              ...HttpErrorFixtures.any,
              error: errorFixture,
            },
          ],
          id: 'call-id',
          interceptors: [],
          middlewares: [],
          nativeMiddlewares: [],
          pipes: [],
          request: RequestFixtures.any,
          response: ResponseFixtures.any,
        };
      });

      describe('when called', () => {
        let result: unknown;
        let wroteTheCallBeforeTheController: boolean;

        beforeAll(async () => {
          const resolvers: Array<() => void> = [];

          const deferWrite: (
            writeMock: ReturnType<typeof vitest.fn>,
          ) => void = (writeMock: ReturnType<typeof vitest.fn>): void => {
            writeMock.mockReturnValueOnce(
              new Promise((resolve: (value: { count: number }) => void) => {
                resolvers.push(() => {
                  resolve({ count: 1 });
                });
              }),
            );
          };

          deferWrite(callCreateMock);
          deferWrite(controllerCreateManyMock);
          deferWrite(guardCreateManyMock);
          deferWrite(httpErrorCreateManyMock);
          deferWrite(responseCreateManyMock);

          const pendingRecord: Promise<void> =
            prismaInsightsPersistenceAdapter.create(callFixture);

          await Promise.resolve();

          wroteTheCallBeforeTheController =
            callCreateMock.mock.calls.length === 1 &&
            controllerCreateManyMock.mock.calls.length === 0;

          for (let attempt: number = 0; attempt < 8; attempt += 1) {
            const pendingResolvers: Array<() => void> = resolvers.splice(
              0,
              resolvers.length,
            );

            for (const resolve of pendingResolvers) {
              resolve();
            }

            await Promise.resolve();
          }

          result = await pendingRecord;
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.$transaction()', () => {
          expect(prismaTransactionMock).toHaveBeenCalledTimes(1);
        });

        it('should call prismaClient.call.create()', () => {
          expect(callCreateMock).toHaveBeenCalledExactlyOnceWith({
            data: {
              id: callFixture.id,
              request: {
                create: {
                  headers: callFixture.request.headers,
                  id: callFixture.request.id,
                  method: callFixture.request.method,
                  started_at: callFixture.request.startedAt,
                  url: callFixture.request.url,
                },
              },
            },
          });
        });

        it('should write the call before its controller', () => {
          expect(wroteTheCallBeforeTheController).toBe(true);
        });

        it('should call prismaClient.controller.createMany()', () => {
          expect(controllerCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                call_id: callFixture.id,
                controller: callFixture.controller?.controller,
                ended_at: callFixture.controller?.endedAt,
                error: serializedErrorFixture,
                id: callFixture.controller?.id,
                method: callFixture.controller?.method,
                started_at: callFixture.controller?.startedAt,
              },
            ],
          });
        });

        it('should call prismaClient.guard.createMany()', () => {
          const guardFixture: (typeof callFixture.guards)[number] = callFixture
            .guards[0] as (typeof callFixture.guards)[number];

          expect(guardCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                allowed: guardFixture.allowed,
                call_id: callFixture.id,
                ended_at: guardFixture.endedAt,
                guard: guardFixture.guard,
                id: guardFixture.id,
                started_at: guardFixture.startedAt,
              },
            ],
          });
        });

        it('should call prismaClient.httpError.createMany()', () => {
          const httpErrorFixture: (typeof callFixture.httpErrors)[number] =
            callFixture
              .httpErrors[0] as (typeof callFixture.httpErrors)[number];

          expect(httpErrorCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                call_id: callFixture.id,
                ended_at: httpErrorFixture.endedAt,
                error: serializedErrorFixture,
                filter: httpErrorFixture.filter,
                id: httpErrorFixture.id,
                started_at: httpErrorFixture.startedAt,
              },
            ],
          });
        });

        it('should call prismaClient.response.createMany()', () => {
          expect(responseCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                aborted: callFixture.response.aborted,
                call_id: callFixture.id,
                headers: callFixture.response.headers,
                id: callFixture.response.id,
                sent_at: callFixture.response.sentAt,
                status_code: callFixture.response.statusCode,
              },
            ],
          });
        });

        it('should not call prismaClient.middleware.createMany()', () => {
          expect(middlewareCreateManyMock).not.toHaveBeenCalled();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.update', () => {
    describe('having one matching call', () => {
      let commandFixture: ExecuteUpdateCommand;

      beforeAll(async () => {
        commandFixture = {
          filter: {
            id: 'call-id',
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          set: {
            httpErrors: [HttpErrorFixtures.any],
          },
        };
        transactionCallFindManyMock.mockResolvedValueOnce([
          {
            id: 'call-id',
          },
        ]);

        await prismaInsightsPersistenceAdapter.update(commandFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should append the http errors for that call', () => {
        expect(httpErrorCreateManyMock).toHaveBeenCalledExactlyOnceWith({
          data: [
            {
              call_id: 'call-id',
              ended_at: HttpErrorFixtures.any.endedAt,
              error: HttpErrorFixtures.any.error,
              filter: HttpErrorFixtures.any.filter,
              id: HttpErrorFixtures.any.id,
              started_at: HttpErrorFixtures.any.startedAt,
            },
          ],
        });
      });
    });

    describe('having two matching calls', () => {
      let commandFixture: ExecuteUpdateCommand;
      let result: unknown;

      beforeAll(async () => {
        commandFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          set: {
            httpErrors: [HttpErrorFixtures.any],
          },
        };
        transactionCallFindManyMock.mockResolvedValueOnce([
          {
            id: 'call-id',
          },
          {
            id: 'other-call-id',
          },
        ]);

        try {
          await prismaInsightsPersistenceAdapter.update(commandFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an Error', () => {
        expect(result).toStrictEqual(new Error('Call update matched 2 calls.'));
      });

      it('should not append http errors', () => {
        expect(httpErrorCreateManyMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('.find', () => {
    describe('having a query with no filters nor pagination', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        let prismaCallFixture: PrismaCallWithRelations;
        let totalFixture: number;

        let result: unknown;

        beforeAll(async () => {
          prismaCallFixture = PrismaCallWithRelationsFixtures.any;
          totalFixture = 7;

          callFindManyMock.mockResolvedValueOnce([prismaCallFixture]);
          callCountMock.mockResolvedValueOnce(totalFixture);
          callFromPrismaCallBuilderMock.build.mockReturnValueOnce(
            CallFixtures.any,
          );

          result = await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: baseWhereFixture,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: baseWhereFixture,
          });
        });

        it('should call callFromPrismaCallBuilder.build()', () => {
          expect(
            callFromPrismaCallBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture);
        });

        it('should not call callFromPrismaCallBuilder.buildOngoing()', () => {
          expect(
            callFromPrismaCallBuilderMock.buildOngoing,
          ).not.toHaveBeenCalled();
        });

        it('should return an CallsFindQueryResult', () => {
          expect(result).toStrictEqual({
            items: [CallFixtures.any],
            total: totalFixture,
          });
        });
      });
    });

    describe('having a query with offset and limit', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: 10,
          offset: 20,
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            skip: 20,
            take: 10,
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query with offset 0 and limit 0', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: 0,
          offset: 0,
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            skip: 0,
            take: 0,
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query with request method', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: 'GET',
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          ...(baseWhereFixture as object),
          request: { method: 'GET' },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query with request method and urlLike', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: { method: 'POST', urlLike: '/foo' },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          ...(baseWhereFixture as object),
          request: { method: 'POST', url: { contains: '/foo' } },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query with response statusCode', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: { method: undefined, urlLike: undefined },
            response: { statusCode: 404 },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          ...(baseWhereFixture as object),
          response: { status_code: 404 },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query with response with no statusCode', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query with request and response filters', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: { method: 'PUT', urlLike: '/bar' },
            response: { statusCode: 500 },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          request: { method: 'PUT', url: { contains: '/bar' } },
          response: { status_code: 500 },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query sorted by startedAt ascending', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: 'startedAtAsc',
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ request: { started_at: 'asc' } }, { id: 'asc' }],
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query sorted by startedAt descending', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: 'startedAtDesc',
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ request: { started_at: 'desc' } }, { id: 'desc' }],
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having an ongoing calls find query with no filters', () => {
      let queryFixture: OngoingCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: null,
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        let prismaCallFixture: PrismaCallWithRelations;
        let totalFixture: number;

        let result: unknown;

        beforeAll(async () => {
          prismaCallFixture = PrismaCallWithRelationsFixtures.withNullResponse;
          totalFixture = 2;

          callFindManyMock.mockResolvedValueOnce([prismaCallFixture]);
          callCountMock.mockResolvedValueOnce(totalFixture);
          callFromPrismaCallBuilderMock.buildOngoing.mockReturnValueOnce({
            controller: undefined,
            guards: [],
            httpErrors: [],
            id: prismaCallFixture.id,
            interceptors: [],
            middlewares: [],
            nativeMiddlewares: [],
            pipes: [],
            request: RequestFixtures.any,
          });

          result = await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: ongoingWhereFixture,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: ongoingWhereFixture,
          });
        });

        it('should call callFromPrismaCallBuilder.buildOngoing()', () => {
          expect(
            callFromPrismaCallBuilderMock.buildOngoing,
          ).toHaveBeenCalledExactlyOnceWith(prismaCallFixture);
        });

        it('should not call callFromPrismaCallBuilder.build()', () => {
          expect(callFromPrismaCallBuilderMock.build).not.toHaveBeenCalled();
        });

        it('should return an OngoingCallsFindQueryResult', () => {
          expect(result).toStrictEqual({
            items: [
              {
                controller: undefined,
                guards: [],
                httpErrors: [],
                id: prismaCallFixture.id,
                interceptors: [],
                middlewares: [],
                nativeMiddlewares: [],
                pipes: [],
                request: RequestFixtures.any,
              },
            ],
            total: totalFixture,
          });
        });
      });
    });

    describe('having an ongoing calls find query with request filters sorted by startedAt ascending', () => {
      let queryFixture: OngoingCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: undefined,
            request: {
              method: 'POST',
              urlLike: '/orders',
            },
            response: null,
            sort: 'startedAtAsc',
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          request: {
            method: 'POST',
            url: { contains: '/orders' },
          },
          response: { is: null },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ request: { started_at: 'asc' } }, { id: 'asc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query filtered by a call id', () => {
      let queryFixture: CompletedCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: 'call-id',
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          id: 'call-id',
          request: { isNot: null },
          response: { isNot: null },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having an ongoing calls find query filtered by a call id', () => {
      let queryFixture: OngoingCallsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: 'call-id',
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: null,
            sort: undefined,
          },
          limit: undefined,
          offset: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          id: 'call-id',
          request: { isNot: null },
          response: { is: null },
        };

        beforeAll(async () => {
          callFindManyMock.mockResolvedValueOnce([]);
          callCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.call.findMany()', () => {
          expect(callFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: callInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.call.count()', () => {
          expect(callCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });
  });
});
