import { inject, injectable } from 'inversify';

import { Prisma, PrismaClient } from '../../../../generated/prisma/client.js';
import { type ExecuteUpdateCommand } from '../../../application/models/ExecuteUpdateCommand.js';
import {
  type BaseExecutionsFilterQuery,
  type ExecutionsFilterQuery,
} from '../../../application/models/ExecutionsFilterQuery.js';
import {
  type CompletedExecutionsFindQuery,
  ExecutionsFindQuery,
  type OngoingExecutionsFindQuery,
} from '../../../application/models/ExecutionsFindQuery.js';
import { ExecutionsFindQueryResult } from '../../../application/models/ExecutionsFindQueryResult.js';
import { OngoingExecutionsFindQueryResult } from '../../../application/models/OngoingExecutionsFindQueryResult.js';
import { type ExecutionPersistenceOutputPort } from '../../../application/ports/ExecutionPersistenceOutputPort.js';
import { type Controller } from '../../../domain/models/Controller.js';
import { type Execution } from '../../../domain/models/Execution.js';
import { type Guard } from '../../../domain/models/Guard.js';
import { type HttpError } from '../../../domain/models/HttpError.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';
import { type Middleware } from '../../../domain/models/Middleware.js';
import { type NativeMiddleware } from '../../../domain/models/NativeMiddleware.js';
import { type OngoingExecution } from '../../../domain/models/OngoingExecution.js';
import { type Pipe } from '../../../domain/models/Pipe.js';
import { type Response } from '../../../domain/models/Response.js';
import {
  ExecutionFromPrismaExecutionBuilder,
  executionInclude,
  type PrismaExecutionWithRelations,
} from '../builders/ExecutionFromPrismaExecutionBuilder.js';

@injectable()
export class PrismaInsightsPersistenceAdapter implements ExecutionPersistenceOutputPort {
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

  public async create(execution: Execution): Promise<void> {
    await this.#prismaClient.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<void> => {
        await transaction.execution.create({
          data: {
            id: execution.id,
            request: {
              create: {
                headers: execution.request.headers,
                id: execution.request.id,
                method: execution.request.method,
                started_at: execution.request.startedAt,
                url: execution.request.url,
              },
            },
          },
        });

        await this.#writeExecutionElements(transaction, execution);
      },
    );
  }

  public async find(
    query: OngoingExecutionsFindQuery,
  ): Promise<OngoingExecutionsFindQueryResult>;
  public async find(
    query: CompletedExecutionsFindQuery,
  ): Promise<ExecutionsFindQueryResult>;
  public async find(
    query: ExecutionsFindQuery,
  ): Promise<ExecutionsFindQueryResult | OngoingExecutionsFindQueryResult> {
    const where: Prisma.ExecutionWhereInput = this.#buildExecutionWhereInput(
      query.filter,
    );

    const [prismaExecutions, total]: [PrismaExecutionWithRelations[], number] =
      await Promise.all([
        this.#prismaClient.execution.findMany({
          include: executionInclude,
          orderBy: this.#buildExecutionOrderBy(query.filter),
          where,
          ...(query.offset === undefined ? {} : { skip: query.offset }),
          ...(query.limit === undefined ? {} : { take: query.limit }),
        }),
        this.#prismaClient.execution.count({
          where,
        }),
      ]);

    if (query.filter.response === null) {
      return {
        items: prismaExecutions.map(
          (prismaExecution: PrismaExecutionWithRelations): OngoingExecution =>
            this.#executionFromPrismaExecutionBuilder.buildOngoing(
              prismaExecution,
            ),
        ),
        total,
      };
    }

    return {
      items: prismaExecutions.map(
        (prismaExecution: PrismaExecutionWithRelations): Execution =>
          this.#executionFromPrismaExecutionBuilder.build(prismaExecution),
      ),
      total,
    };
  }

  public async update(command: ExecuteUpdateCommand): Promise<void> {
    await this.#prismaClient.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<void> => {
        const executionId: string = await this.#readSingleExecutionId(
          transaction,
          command.filter,
        );

        if (command.set.httpErrors.length === 0) {
          return;
        }

        await transaction.httpError.createMany({
          data: command.set.httpErrors.map(
            (httpError: HttpError): Prisma.HttpErrorCreateManyInput =>
              this.#buildHttpErrorCreateManyInput(executionId, httpError),
          ),
        });
      },
    );
  }

  #buildControllerCreateManyInput(
    executionId: string,
    controller: Controller,
  ): Prisma.ControllerCreateManyInput {
    return this.#withOptionalError(
      {
        controller: controller.controller,
        ended_at: controller.endedAt,
        execution_id: executionId,
        id: controller.id,
        method: controller.method,
        started_at: controller.startedAt,
      },
      controller.error,
    );
  }

  #buildExecutionIdWhereInput(
    id: string | undefined,
  ): Prisma.ExecutionWhereInput {
    if (id === undefined) {
      return {};
    }

    return {
      id,
    };
  }

  #buildExecutionOrderBy(
    query: BaseExecutionsFilterQuery,
  ): Prisma.ExecutionOrderByWithRelationInput[] {
    switch (query.sort) {
      case 'startedAtAsc':
        return [
          {
            request: {
              started_at: 'asc',
            },
          },
          {
            id: 'asc',
          },
        ];
      case 'startedAtDesc':
        return [
          {
            request: {
              started_at: 'desc',
            },
          },
          {
            id: 'desc',
          },
        ];
      case undefined:
        return [
          {
            created_at: 'desc',
          },
          {
            id: 'desc',
          },
        ];
    }
  }

  #buildExecutionWhereInput(
    query: ExecutionsFilterQuery,
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

    const whereExecutionId: Prisma.ExecutionWhereInput =
      this.#buildExecutionIdWhereInput(query.id);

    if (query.response === null) {
      return {
        ...whereExecutionId,
        request: whereRequest,
        response: {
          is: null,
        },
      };
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
      ...whereExecutionId,
      request: whereRequest,
      response: whereResponse,
    };

    return where;
  }

  #buildGuardCreateManyInput(
    executionId: string,
    guard: Guard,
  ): Prisma.GuardCreateManyInput {
    return this.#withOptionalError(
      {
        allowed: guard.allowed,
        ended_at: guard.endedAt,
        execution_id: executionId,
        guard: guard.guard,
        id: guard.id,
        started_at: guard.startedAt,
      },
      guard.error,
    );
  }

  #buildHttpErrorCreateManyInput(
    executionId: string,
    httpError: HttpError,
  ): Prisma.HttpErrorCreateManyInput {
    return {
      ended_at: httpError.endedAt,
      error: this.#toRequiredInputJsonValue(httpError.error),
      execution_id: executionId,
      filter: httpError.filter,
      id: httpError.id,
      started_at: httpError.startedAt,
    };
  }

  #buildInterceptorCreateManyInput(
    executionId: string,
    interceptor: Interceptor,
  ): Prisma.InterceptorCreateManyInput {
    return this.#withOptionalError(
      {
        ended_at: interceptor.endedAt,
        execution_id: executionId,
        id: interceptor.id,
        interceptor: interceptor.interceptor,
        started_at: interceptor.startedAt,
      },
      interceptor.error,
    );
  }

  #buildMiddlewareCreateManyInput(
    executionId: string,
    middleware: Middleware,
  ): Prisma.MiddlewareCreateManyInput {
    return this.#withOptionalError(
      {
        ended_at: middleware.endedAt,
        execution_id: executionId,
        id: middleware.id,
        middleware: middleware.middleware,
        phase: middleware.phase,
        started_at: middleware.startedAt,
      },
      middleware.error,
    );
  }

  #buildNativeMiddlewareCreateManyInput(
    executionId: string,
    nativeMiddleware: NativeMiddleware,
  ): Prisma.NativeMiddlewareCreateManyInput {
    return this.#withOptionalError(
      {
        ended_at: nativeMiddleware.endedAt,
        execution_id: executionId,
        id: nativeMiddleware.id,
        name: nativeMiddleware.name,
        started_at: nativeMiddleware.startedAt,
      },
      nativeMiddleware.error,
    );
  }

  #buildPipeCreateManyInput(
    executionId: string,
    pipe: Pipe,
  ): Prisma.PipeCreateManyInput {
    return this.#withOptionalError(
      {
        ended_at: pipe.endedAt,
        execution_id: executionId,
        id: pipe.id,
        method: pipe.method,
        parameter_index: pipe.parameterIndex,
        pipe: pipe.pipe,
        started_at: pipe.startedAt,
      },
      pipe.error,
    );
  }

  #buildResponseCreateManyInput(
    executionId: string,
    response: Response,
  ): Prisma.ResponseCreateManyInput {
    return {
      aborted: response.aborted,
      execution_id: executionId,
      headers: response.headers,
      id: response.id,
      sent_at: response.sentAt,
      status_code: response.statusCode,
    };
  }

  #errorToJsonObject(
    error: Error,
    seen: WeakSet<object>,
  ): Prisma.InputJsonObject {
    const json: { [key: string]: Prisma.InputJsonValue | null } = {
      message: error.message,
      name: error.name,
    };

    if (typeof error.stack === 'string') {
      json['stack'] = error.stack;
    }

    if (error.cause !== undefined) {
      const cause: Prisma.InputJsonValue | null | undefined = this.#toJsonValue(
        error.cause,
        seen,
      );

      if (cause !== undefined) {
        json['cause'] = cause;
      }
    }

    if (error instanceof AggregateError) {
      json['errors'] = error.errors.map(
        (item: unknown): Prisma.InputJsonValue | null => {
          const jsonItem: Prisma.InputJsonValue | null | undefined =
            this.#toJsonValue(item, seen);

          return jsonItem === undefined ? null : jsonItem;
        },
      );
    }

    const record: Record<string, unknown> = error as unknown as Record<
      string,
      unknown
    >;

    for (const key of Object.keys(error)) {
      if (
        key === 'cause' ||
        key === 'errors' ||
        key === 'message' ||
        key === 'name' ||
        key === 'stack'
      ) {
        continue;
      }

      const extra: Prisma.InputJsonValue | null | undefined = this.#toJsonValue(
        record[key],
        seen,
      );

      if (extra !== undefined) {
        json[key] = extra;
      }
    }

    return json;
  }

  async #readSingleExecutionId(
    transaction: Prisma.TransactionClient,
    filter: ExecutionsFilterQuery,
  ): Promise<string> {
    const matches: { id: string }[] = await transaction.execution.findMany({
      select: {
        id: true,
      },
      where: this.#buildExecutionWhereInput(filter),
    });

    if (matches.length !== 1) {
      throw new Error(
        `Execution update matched ${String(matches.length)} executions.`,
      );
    }

    const match: { id: string } | undefined = matches[0];

    if (match === undefined) {
      throw new Error(
        `Execution update matched ${String(matches.length)} executions.`,
      );
    }

    return match.id;
  }

  #toInputJsonValue(error: unknown): Prisma.InputJsonValue | undefined {
    if (error === null || error === undefined) {
      return undefined;
    }

    const json: Prisma.InputJsonValue | null | undefined = this.#toJsonValue(
      error,
      new WeakSet(),
    );

    return json === null || json === undefined ? undefined : json;
  }

  #toJsonValue(
    value: unknown,
    seen: WeakSet<object>,
  ): Prisma.InputJsonValue | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value !== 'object') {
      return undefined;
    }

    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return this.#errorToJsonObject(value, seen);
    }

    if (Array.isArray(value)) {
      return value.map((item: unknown): Prisma.InputJsonValue | null => {
        const jsonItem: Prisma.InputJsonValue | null | undefined =
          this.#toJsonValue(item, seen);

        return jsonItem === undefined ? null : jsonItem;
      });
    }

    const json: { [key: string]: Prisma.InputJsonValue | null } = {};

    for (const [key, entry] of Object.entries(value)) {
      const jsonEntry: Prisma.InputJsonValue | null | undefined =
        this.#toJsonValue(entry, seen);

      if (jsonEntry !== undefined) {
        json[key] = jsonEntry;
      }
    }

    return json;
  }

  #toRequiredInputJsonValue(
    error: unknown,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    const jsonError: Prisma.InputJsonValue | undefined =
      this.#toInputJsonValue(error);

    if (jsonError === undefined) {
      return Prisma.JsonNull;
    }

    return jsonError;
  }

  #withOptionalError<T extends object>(input: T, error: unknown): T {
    const jsonError: Prisma.InputJsonValue | undefined =
      this.#toInputJsonValue(error);

    if (jsonError === undefined) {
      return input;
    }

    return {
      ...input,
      error: jsonError,
    };
  }

  async #writeExecutionElements(
    transaction: Prisma.TransactionClient,
    execution: Execution,
  ): Promise<void> {
    const executionId: string = execution.id;
    const controller: Controller | undefined = execution.controller;

    if (controller !== undefined) {
      await transaction.controller.createMany({
        data: [this.#buildControllerCreateManyInput(executionId, controller)],
      });
    }

    if (execution.guards.length > 0) {
      await transaction.guard.createMany({
        data: execution.guards.map(
          (guard: Guard): Prisma.GuardCreateManyInput =>
            this.#buildGuardCreateManyInput(executionId, guard),
        ),
      });
    }

    if (execution.httpErrors.length > 0) {
      await transaction.httpError.createMany({
        data: execution.httpErrors.map(
          (httpError: HttpError): Prisma.HttpErrorCreateManyInput =>
            this.#buildHttpErrorCreateManyInput(executionId, httpError),
        ),
      });
    }

    if (execution.interceptors.length > 0) {
      await transaction.interceptor.createMany({
        data: execution.interceptors.map(
          (interceptor: Interceptor): Prisma.InterceptorCreateManyInput =>
            this.#buildInterceptorCreateManyInput(executionId, interceptor),
        ),
      });
    }

    if (execution.middlewares.length > 0) {
      await transaction.middleware.createMany({
        data: execution.middlewares.map(
          (middleware: Middleware): Prisma.MiddlewareCreateManyInput =>
            this.#buildMiddlewareCreateManyInput(executionId, middleware),
        ),
      });
    }

    if (execution.nativeMiddlewares.length > 0) {
      await transaction.nativeMiddleware.createMany({
        data: execution.nativeMiddlewares.map(
          (
            nativeMiddleware: NativeMiddleware,
          ): Prisma.NativeMiddlewareCreateManyInput =>
            this.#buildNativeMiddlewareCreateManyInput(
              executionId,
              nativeMiddleware,
            ),
        ),
      });
    }

    if (execution.pipes.length > 0) {
      await transaction.pipe.createMany({
        data: execution.pipes.map((pipe: Pipe): Prisma.PipeCreateManyInput =>
          this.#buildPipeCreateManyInput(executionId, pipe),
        ),
      });
    }

    await transaction.response.createMany({
      data: [
        this.#buildResponseCreateManyInput(executionId, execution.response),
      ],
    });
  }
}
