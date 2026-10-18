import { inject, injectable } from 'inversify';

import {
  type Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js';
import { InsightsFindQuery } from '../../../application/models/InsightsFindQuery.js';
import { InsightsFindQueryResult } from '../../../application/models/InsightsFindQueryResult.js';
import { type InsightsPersistenceOutputPort } from '../../../application/ports/InsightsPersistenceOutputPort.js';
import { type Execution } from '../../../domain/models/Execution.js';
import {
  ExecutionFromPrismaExecutionBuilder,
  executionInclude,
  type PrismaExecutionWithRelations,
} from '../builders/ExecutionFromPrismaExecutionBuilder.js';

@injectable()
export class PrismaInsightsPersistenceAdapter implements InsightsPersistenceOutputPort {
  readonly #executionFromPrismaExecutionBuilder: ExecutionFromPrismaExecutionBuilder;
  readonly #prismaClient: PrismaClient;

  constructor(
    @inject(ExecutionFromPrismaExecutionBuilder)
    executionFromPrismaExecutionBuilder: ExecutionFromPrismaExecutionBuilder,
    @inject(PrismaClient)
    prismaClient: PrismaClient,
  ) {
    this.#executionFromPrismaExecutionBuilder =
      executionFromPrismaExecutionBuilder;
    this.#prismaClient = prismaClient;
  }

  public async find(
    query: InsightsFindQuery,
  ): Promise<InsightsFindQueryResult> {
    const where: Prisma.ExecutionWhereInput =
      this.#buildExecutionWhereInput(query);

    const [prismaExecutions, total]: [PrismaExecutionWithRelations[], number] =
      await Promise.all([
        this.#prismaClient.execution.findMany({
          include: executionInclude,
          orderBy: this.#buildExecutionOrderBy(query),
          where,
          ...(query.offset === undefined ? {} : { skip: query.offset }),
          ...(query.limit === undefined ? {} : { take: query.limit }),
        }),
        this.#prismaClient.execution.count({
          where,
        }),
      ]);

    return {
      items: prismaExecutions.map(
        (prismaExecution: PrismaExecutionWithRelations): Execution =>
          this.#executionFromPrismaExecutionBuilder.build(prismaExecution),
      ),
      total,
    };
  }

  #buildExecutionOrderBy(
    query: InsightsFindQuery,
  ): Prisma.ExecutionOrderByWithRelationInput {
    switch (query.sort) {
      case 'startedAtAsc':
        return {
          request: {
            started_at: 'asc',
          },
        };
      case 'startedAtDesc':
        return {
          request: {
            started_at: 'desc',
          },
        };
      case undefined:
        return {
          created_at: 'desc',
        };
    }
  }

  #buildExecutionWhereInput(
    query: InsightsFindQuery,
  ): Prisma.ExecutionWhereInput {
    let whereRequest: Prisma.XOR<
      Prisma.RequestNullableScalarRelationFilter,
      Prisma.RequestWhereInput
    >;

    if (
      query.request.method === undefined &&
      query.request.urlLike === undefined
    ) {
      whereRequest = {
        isNot: null,
      };
    } else {
      whereRequest = {};

      if (query.request.method !== undefined) {
        whereRequest.method = query.request.method;
      }

      if (query.request.urlLike !== undefined) {
        whereRequest.url = { contains: query.request.urlLike };
      }
    }

    let whereResponse: Prisma.XOR<
      Prisma.ResponseNullableScalarRelationFilter,
      Prisma.ResponseWhereInput
    >;

    if (query.response.statusCode === undefined) {
      whereResponse = {
        isNot: null,
      };
    } else {
      whereResponse = {
        status_code: query.response.statusCode,
      };
    }

    const where: Prisma.ExecutionWhereInput = {
      controller: {
        isNot: null,
      },
      request: whereRequest,
      response: whereResponse,
    };

    return where;
  }
}
