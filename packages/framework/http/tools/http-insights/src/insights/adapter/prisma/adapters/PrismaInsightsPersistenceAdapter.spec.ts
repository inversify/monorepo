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
import { type InsightsFindQuery } from '../../../application/models/InsightsFindQuery.js';
import { ExecutionFixtures } from '../../../domain/fixtures/ExecutionFixtures.js';
import {
  type ExecutionFromPrismaExecutionBuilder,
  executionInclude,
  type PrismaExecutionWithRelations,
} from '../builders/ExecutionFromPrismaExecutionBuilder.js';
import { PrismaExecutionWithRelationsFixtures } from '../fixtures/PrismaExecutionWithRelationsFixtures.js';
import { PrismaInsightsPersistenceAdapter } from './PrismaInsightsPersistenceAdapter.js';

const baseWhereFixture: unknown = {
  controller: { isNot: null },
  request: { isNot: null },
  response: { isNot: null },
};

describe(PrismaInsightsPersistenceAdapter, () => {
  let executionFromPrismaExecutionBuilderMock: Mocked<ExecutionFromPrismaExecutionBuilder>;
  let prismaClientMock: Mocked<PrismaClient>;
  let executionFindManyMock: ReturnType<typeof vitest.fn>;
  let executionCountMock: ReturnType<typeof vitest.fn>;

  let prismaInsightsPersistenceAdapter: PrismaInsightsPersistenceAdapter;

  beforeAll(() => {
    executionFromPrismaExecutionBuilderMock = {
      build: vitest.fn(),
    } as Partial<
      Mocked<ExecutionFromPrismaExecutionBuilder>
    > as Mocked<ExecutionFromPrismaExecutionBuilder>;
    executionFindManyMock = vitest.fn();
    executionCountMock = vitest.fn();
    prismaClientMock = {
      execution: {
        count: executionCountMock,
        findMany: executionFindManyMock,
      },
    } as unknown as Mocked<PrismaClient>;

    prismaInsightsPersistenceAdapter = new PrismaInsightsPersistenceAdapter(
      executionFromPrismaExecutionBuilderMock,
      prismaClientMock,
    );
  });

  describe('.find', () => {
    describe('having a query with no filters nor pagination', () => {
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: {
            method: undefined,
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: undefined,
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

        it('should return a PersistenceFindQueryResult', () => {
          expect(result).toStrictEqual({
            items: [ExecutionFixtures.any],
            total: totalFixture,
          });
        });
      });
    });

    describe('having a query with offset and limit', () => {
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: 10,
          offset: 20,
          request: {
            method: undefined,
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: undefined,
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: 0,
          offset: 0,
          request: {
            method: undefined,
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: undefined,
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: {
            method: 'GET',
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: undefined,
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: { method: 'POST', urlLike: '/foo' },
          response: {
            statusCode: undefined,
          },
          sort: undefined,
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: { method: undefined, urlLike: undefined },
          response: { statusCode: 404 },
          sort: undefined,
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: {
            method: undefined,
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: undefined,
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: { method: 'PUT', urlLike: '/bar' },
          response: { statusCode: 500 },
          sort: undefined,
        };
      });

      describe('when called', () => {
        const expectedWhere: unknown = {
          controller: { isNot: null },
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: {
            method: undefined,
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: 'startedAtAsc',
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
      let queryFixture: InsightsFindQuery;

      beforeAll(() => {
        queryFixture = {
          limit: undefined,
          offset: undefined,
          request: {
            method: undefined,
            urlLike: undefined,
          },
          response: {
            statusCode: undefined,
          },
          sort: 'startedAtDesc',
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
  });
});
