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
import { type ExecuteUpdateCommand } from '../../../application/models/ExecuteUpdateCommand.js';
import {
  type CompletedExecutionsFindQuery,
  type OngoingExecutionsFindQuery,
} from '../../../application/models/ExecutionsFindQuery.js';
import { ControllerFixtures } from '../../../domain/fixtures/ControllerFixtures.js';
import { ExecutionFixtures } from '../../../domain/fixtures/ExecutionFixtures.js';
import { GuardFixtures } from '../../../domain/fixtures/GuardFixtures.js';
import { HttpErrorFixtures } from '../../../domain/fixtures/HttpErrorFixtures.js';
import { RequestFixtures } from '../../../domain/fixtures/RequestFixtures.js';
import { ResponseFixtures } from '../../../domain/fixtures/ResponseFixtures.js';
import { type Execution } from '../../../domain/models/Execution.js';
import {
  type ExecutionFromPrismaExecutionBuilder,
  executionInclude,
  type PrismaExecutionWithRelations,
} from '../builders/ExecutionFromPrismaExecutionBuilder.js';
import { PrismaExecutionWithRelationsFixtures } from '../fixtures/PrismaExecutionWithRelationsFixtures.js';
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
  let executionFromPrismaExecutionBuilderMock: Mocked<ExecutionFromPrismaExecutionBuilder>;
  let prismaClientMock: Mocked<PrismaClient>;
  let executionCreateMock: ReturnType<typeof vitest.fn>;
  let executionFindManyMock: ReturnType<typeof vitest.fn>;
  let transactionExecutionFindManyMock: ReturnType<typeof vitest.fn>;
  let executionCountMock: ReturnType<typeof vitest.fn>;
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
    executionFromPrismaExecutionBuilderMock = {
      build: vitest.fn(),
      buildOngoing: vitest.fn(),
    } as Partial<
      Mocked<ExecutionFromPrismaExecutionBuilder>
    > as Mocked<ExecutionFromPrismaExecutionBuilder>;
    executionCreateMock = vitest.fn();
    executionFindManyMock = vitest.fn();
    transactionExecutionFindManyMock = vitest.fn();
    executionCountMock = vitest.fn();
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
      execution: {
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
      controller: {
        createMany: controllerCreateManyMock,
      },
      execution: {
        create: executionCreateMock,
        findMany: transactionExecutionFindManyMock,
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
      execution: {
        count: executionCountMock,
        create: executionCreateMock,
        findMany: executionFindManyMock,
      },
    } as unknown as Mocked<PrismaClient>;

    prismaInsightsPersistenceAdapter = new PrismaInsightsPersistenceAdapter(
      executionFromPrismaExecutionBuilderMock,
      prismaClientMock,
    );
  });

  describe('.create', () => {
    describe('having an execution whose errors are Error values', () => {
      let causeFixture: Error;
      let errorFixture: Error;
      let executionFixture: Execution;
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
        executionFixture = {
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
          id: 'execution-id',
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
        let wroteTheExecutionBeforeTheController: boolean;

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

          deferWrite(executionCreateMock);
          deferWrite(controllerCreateManyMock);
          deferWrite(guardCreateManyMock);
          deferWrite(httpErrorCreateManyMock);
          deferWrite(responseCreateManyMock);

          const pendingRecord: Promise<void> =
            prismaInsightsPersistenceAdapter.create(executionFixture);

          await Promise.resolve();

          wroteTheExecutionBeforeTheController =
            executionCreateMock.mock.calls.length === 1 &&
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

        it('should call prismaClient.execution.create()', () => {
          expect(executionCreateMock).toHaveBeenCalledExactlyOnceWith({
            data: {
              id: executionFixture.id,
              request: {
                create: {
                  headers: executionFixture.request.headers,
                  id: executionFixture.request.id,
                  method: executionFixture.request.method,
                  started_at: executionFixture.request.startedAt,
                  url: executionFixture.request.url,
                },
              },
            },
          });
        });

        it('should write the execution before its controller', () => {
          expect(wroteTheExecutionBeforeTheController).toBe(true);
        });

        it('should call prismaClient.controller.createMany()', () => {
          expect(controllerCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                controller: executionFixture.controller?.controller,
                ended_at: executionFixture.controller?.endedAt,
                error: serializedErrorFixture,
                execution_id: executionFixture.id,
                id: executionFixture.controller?.id,
                method: executionFixture.controller?.method,
                started_at: executionFixture.controller?.startedAt,
              },
            ],
          });
        });

        it('should call prismaClient.guard.createMany()', () => {
          const guardFixture: (typeof executionFixture.guards)[number] =
            executionFixture
              .guards[0] as (typeof executionFixture.guards)[number];

          expect(guardCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                allowed: guardFixture.allowed,
                ended_at: guardFixture.endedAt,
                execution_id: executionFixture.id,
                guard: guardFixture.guard,
                id: guardFixture.id,
                started_at: guardFixture.startedAt,
              },
            ],
          });
        });

        it('should call prismaClient.httpError.createMany()', () => {
          const httpErrorFixture: (typeof executionFixture.httpErrors)[number] =
            executionFixture
              .httpErrors[0] as (typeof executionFixture.httpErrors)[number];

          expect(httpErrorCreateManyMock).toHaveBeenCalledExactlyOnceWith({
            data: [
              {
                ended_at: httpErrorFixture.endedAt,
                error: serializedErrorFixture,
                execution_id: executionFixture.id,
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
                aborted: executionFixture.response.aborted,
                execution_id: executionFixture.id,
                headers: executionFixture.response.headers,
                id: executionFixture.response.id,
                sent_at: executionFixture.response.sentAt,
                status_code: executionFixture.response.statusCode,
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
    describe('having one matching execution', () => {
      let commandFixture: ExecuteUpdateCommand;

      beforeAll(async () => {
        commandFixture = {
          filter: {
            id: 'execution-id',
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
        transactionExecutionFindManyMock.mockResolvedValueOnce([
          {
            id: 'execution-id',
          },
        ]);

        await prismaInsightsPersistenceAdapter.update(commandFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should append the http errors for that execution', () => {
        expect(httpErrorCreateManyMock).toHaveBeenCalledExactlyOnceWith({
          data: [
            {
              ended_at: HttpErrorFixtures.any.endedAt,
              error: HttpErrorFixtures.any.error,
              execution_id: 'execution-id',
              filter: HttpErrorFixtures.any.filter,
              id: HttpErrorFixtures.any.id,
              started_at: HttpErrorFixtures.any.startedAt,
            },
          ],
        });
      });
    });

    describe('having two matching executions', () => {
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
        transactionExecutionFindManyMock.mockResolvedValueOnce([
          {
            id: 'execution-id',
          },
          {
            id: 'other-execution-id',
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
        expect(result).toStrictEqual(
          new Error('Execution update matched 2 executions.'),
        );
      });

      it('should not append http errors', () => {
        expect(httpErrorCreateManyMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('.find', () => {
    describe('having a query with no filters nor pagination', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
        let prismaExecutionFixture: PrismaExecutionWithRelations;
        let totalFixture: number;

        let result: unknown;

        beforeAll(async () => {
          prismaExecutionFixture = PrismaExecutionWithRelationsFixtures.any;
          totalFixture = 7;

          executionFindManyMock.mockResolvedValueOnce([prismaExecutionFixture]);
          executionCountMock.mockResolvedValueOnce(totalFixture);
          executionFromPrismaExecutionBuilderMock.build.mockReturnValueOnce(
            ExecutionFixtures.any,
          );

          result = await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: baseWhereFixture,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: baseWhereFixture,
          });
        });

        it('should call executionFromPrismaExecutionBuilder.build()', () => {
          expect(
            executionFromPrismaExecutionBuilderMock.build,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture);
        });

        it('should not call executionFromPrismaExecutionBuilder.buildOngoing()', () => {
          expect(
            executionFromPrismaExecutionBuilderMock.buildOngoing,
          ).not.toHaveBeenCalled();
        });

        it('should return an ExecutionsFindQueryResult', () => {
          expect(result).toStrictEqual({
            items: [ExecutionFixtures.any],
            total: totalFixture,
          });
        });
      });
    });

    describe('having a query with offset and limit', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            skip: 20,
            take: 10,
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query with offset 0 and limit 0', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            skip: 0,
            take: 0,
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query with request method', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query with request method and urlLike', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query with response statusCode', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query with response with no statusCode', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query with request and response filters', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query sorted by startedAt ascending', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ request: { started_at: 'asc' } }, { id: 'asc' }],
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having a query sorted by startedAt descending', () => {
      let queryFixture: CompletedExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ request: { started_at: 'desc' } }, { id: 'desc' }],
            where: baseWhereFixture,
          });
        });
      });
    });

    describe('having an ongoing executions find query with no filters', () => {
      let queryFixture: OngoingExecutionsFindQuery;

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
        let prismaExecutionFixture: PrismaExecutionWithRelations;
        let totalFixture: number;

        let result: unknown;

        beforeAll(async () => {
          prismaExecutionFixture =
            PrismaExecutionWithRelationsFixtures.withNullResponse;
          totalFixture = 2;

          executionFindManyMock.mockResolvedValueOnce([prismaExecutionFixture]);
          executionCountMock.mockResolvedValueOnce(totalFixture);
          executionFromPrismaExecutionBuilderMock.buildOngoing.mockReturnValueOnce(
            {
              controller: undefined,
              guards: [],
              httpErrors: [],
              id: prismaExecutionFixture.id,
              interceptors: [],
              middlewares: [],
              nativeMiddlewares: [],
              pipes: [],
              request: RequestFixtures.any,
            },
          );

          result = await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: ongoingWhereFixture,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: ongoingWhereFixture,
          });
        });

        it('should call executionFromPrismaExecutionBuilder.buildOngoing()', () => {
          expect(
            executionFromPrismaExecutionBuilderMock.buildOngoing,
          ).toHaveBeenCalledExactlyOnceWith(prismaExecutionFixture);
        });

        it('should not call executionFromPrismaExecutionBuilder.build()', () => {
          expect(
            executionFromPrismaExecutionBuilderMock.build,
          ).not.toHaveBeenCalled();
        });

        it('should return an OngoingExecutionsFindQueryResult', () => {
          expect(result).toStrictEqual({
            items: [
              {
                controller: undefined,
                guards: [],
                httpErrors: [],
                id: prismaExecutionFixture.id,
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

    describe('having an ongoing executions find query with request filters sorted by startedAt ascending', () => {
      let queryFixture: OngoingExecutionsFindQuery;

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
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ request: { started_at: 'asc' } }, { id: 'asc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having a query filtered by an execution id', () => {
      let queryFixture: CompletedExecutionsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: 'execution-id',
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
          id: 'execution-id',
          request: { isNot: null },
          response: { isNot: null },
        };

        beforeAll(async () => {
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });

    describe('having an ongoing executions find query filtered by an execution id', () => {
      let queryFixture: OngoingExecutionsFindQuery;

      beforeAll(() => {
        queryFixture = {
          filter: {
            id: 'execution-id',
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
          id: 'execution-id',
          request: { isNot: null },
          response: { is: null },
        };

        beforeAll(async () => {
          executionFindManyMock.mockResolvedValueOnce([]);
          executionCountMock.mockResolvedValueOnce(0);

          await prismaInsightsPersistenceAdapter.find(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call prismaClient.execution.findMany()', () => {
          expect(executionFindManyMock).toHaveBeenCalledExactlyOnceWith({
            include: executionInclude,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            where: expectedWhere,
          });
        });

        it('should call prismaClient.execution.count()', () => {
          expect(executionCountMock).toHaveBeenCalledExactlyOnceWith({
            where: expectedWhere,
          });
        });
      });
    });
  });
});
