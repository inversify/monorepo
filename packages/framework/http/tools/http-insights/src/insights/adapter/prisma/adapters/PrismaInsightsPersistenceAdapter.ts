import { inject, injectable } from 'inversify';

import { Prisma, PrismaClient } from '../../../../generated/prisma/client.js';
import {
  type BaseCallsFilterQuery,
  type CallsFilterQuery,
} from '../../../application/models/CallsFilterQuery.js';
import {
  CallsFindQuery,
  type CompletedCallsFindQuery,
  type OngoingCallsFindQuery,
} from '../../../application/models/CallsFindQuery.js';
import { CallsFindQueryResult } from '../../../application/models/CallsFindQueryResult.js';
import { type ExecuteUpdateCommand } from '../../../application/models/ExecuteUpdateCommand.js';
import { OngoingCallsFindQueryResult } from '../../../application/models/OngoingCallsFindQueryResult.js';
import { type CallPersistenceOutputPort } from '../../../application/ports/CallPersistenceOutputPort.js';
import { type Call } from '../../../domain/models/Call.js';
import { type Controller } from '../../../domain/models/Controller.js';
import { type Guard } from '../../../domain/models/Guard.js';
import { type HttpError } from '../../../domain/models/HttpError.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';
import { type Middleware } from '../../../domain/models/Middleware.js';
import { type NativeMiddleware } from '../../../domain/models/NativeMiddleware.js';
import { type OngoingCall } from '../../../domain/models/OngoingCall.js';
import { type Pipe } from '../../../domain/models/Pipe.js';
import { type Response } from '../../../domain/models/Response.js';
import {
  CallFromPrismaCallBuilder,
  callInclude,
  type PrismaCallWithRelations,
} from '../builders/CallFromPrismaCallBuilder.js';

@injectable()
export class PrismaInsightsPersistenceAdapter implements CallPersistenceOutputPort {
  readonly #callFromPrismaCallBuilder: CallFromPrismaCallBuilder;
  readonly #prismaClient: PrismaClient;

  constructor(
    @inject(CallFromPrismaCallBuilder)
    callFromPrismaCallBuilder: CallFromPrismaCallBuilder,
    @inject(PrismaClient)
    prismaClient: PrismaClient,
  ) {
    this.#callFromPrismaCallBuilder = callFromPrismaCallBuilder;
    this.#prismaClient = prismaClient;
  }

  public async create(call: Call): Promise<void> {
    await this.#prismaClient.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<void> => {
        await transaction.call.create({
          data: {
            id: call.id,
            request: {
              create: {
                headers: call.request.headers,
                id: call.request.id,
                method: call.request.method,
                started_at: call.request.startedAt,
                url: call.request.url,
              },
            },
          },
        });

        await this.#writeCallElements(transaction, call);
      },
    );
  }

  public async find(
    query: OngoingCallsFindQuery,
  ): Promise<OngoingCallsFindQueryResult>;
  public async find(
    query: CompletedCallsFindQuery,
  ): Promise<CallsFindQueryResult>;
  public async find(
    query: CallsFindQuery,
  ): Promise<CallsFindQueryResult | OngoingCallsFindQueryResult> {
    const where: Prisma.CallWhereInput = this.#buildCallWhereInput(
      query.filter,
    );

    const [prismaCalls, total]: [PrismaCallWithRelations[], number] =
      await Promise.all([
        this.#prismaClient.call.findMany({
          include: callInclude,
          orderBy: this.#buildCallOrderBy(query.filter),
          where,
          ...(query.offset === undefined ? {} : { skip: query.offset }),
          ...(query.limit === undefined ? {} : { take: query.limit }),
        }),
        this.#prismaClient.call.count({
          where,
        }),
      ]);

    if (query.filter.response === null) {
      return {
        items: prismaCalls.map(
          (prismaCall: PrismaCallWithRelations): OngoingCall =>
            this.#callFromPrismaCallBuilder.buildOngoing(prismaCall),
        ),
        total,
      };
    }

    return {
      items: prismaCalls.map((prismaCall: PrismaCallWithRelations): Call =>
        this.#callFromPrismaCallBuilder.build(prismaCall),
      ),
      total,
    };
  }

  public async update(command: ExecuteUpdateCommand): Promise<void> {
    await this.#prismaClient.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<void> => {
        const callId: string = await this.#readSingleCallId(
          transaction,
          command.filter,
        );

        if (command.set.httpErrors.length === 0) {
          return;
        }

        await transaction.httpError.createMany({
          data: command.set.httpErrors.map(
            (httpError: HttpError): Prisma.HttpErrorCreateManyInput =>
              this.#buildHttpErrorCreateManyInput(callId, httpError),
          ),
        });
      },
    );
  }

  #buildControllerCreateManyInput(
    callId: string,
    controller: Controller,
  ): Prisma.ControllerCreateManyInput {
    return this.#withOptionalError(
      {
        call_id: callId,
        controller: controller.controller,
        ended_at: controller.endedAt,
        id: controller.id,
        method: controller.method,
        started_at: controller.startedAt,
      },
      controller.error,
    );
  }

  #buildCallIdWhereInput(id: string | undefined): Prisma.CallWhereInput {
    if (id === undefined) {
      return {};
    }

    return {
      id,
    };
  }

  #buildCallOrderBy(
    query: BaseCallsFilterQuery,
  ): Prisma.CallOrderByWithRelationInput[] {
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

  #buildCallWhereInput(query: CallsFilterQuery): Prisma.CallWhereInput {
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

    const whereCallId: Prisma.CallWhereInput = this.#buildCallIdWhereInput(
      query.id,
    );

    if (query.response === null) {
      return {
        ...whereCallId,
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

    const where: Prisma.CallWhereInput = {
      ...whereCallId,
      request: whereRequest,
      response: whereResponse,
    };

    return where;
  }

  #buildGuardCreateManyInput(
    callId: string,
    guard: Guard,
  ): Prisma.GuardCreateManyInput {
    return this.#withOptionalError(
      {
        allowed: guard.allowed,
        call_id: callId,
        ended_at: guard.endedAt,
        guard: guard.guard,
        id: guard.id,
        started_at: guard.startedAt,
      },
      guard.error,
    );
  }

  #buildHttpErrorCreateManyInput(
    callId: string,
    httpError: HttpError,
  ): Prisma.HttpErrorCreateManyInput {
    return {
      call_id: callId,
      ended_at: httpError.endedAt,
      error: this.#toRequiredInputJsonValue(httpError.error),
      filter: httpError.filter,
      id: httpError.id,
      started_at: httpError.startedAt,
    };
  }

  #buildInterceptorCreateManyInput(
    callId: string,
    interceptor: Interceptor,
  ): Prisma.InterceptorCreateManyInput {
    return this.#withOptionalError(
      {
        call_id: callId,
        ended_at: interceptor.endedAt,
        id: interceptor.id,
        interceptor: interceptor.interceptor,
        started_at: interceptor.startedAt,
      },
      interceptor.error,
    );
  }

  #buildMiddlewareCreateManyInput(
    callId: string,
    middleware: Middleware,
  ): Prisma.MiddlewareCreateManyInput {
    return this.#withOptionalError(
      {
        call_id: callId,
        ended_at: middleware.endedAt,
        id: middleware.id,
        middleware: middleware.middleware,
        phase: middleware.phase,
        started_at: middleware.startedAt,
      },
      middleware.error,
    );
  }

  #buildNativeMiddlewareCreateManyInput(
    callId: string,
    nativeMiddleware: NativeMiddleware,
  ): Prisma.NativeMiddlewareCreateManyInput {
    return this.#withOptionalError(
      {
        call_id: callId,
        ended_at: nativeMiddleware.endedAt,
        id: nativeMiddleware.id,
        name: nativeMiddleware.name,
        started_at: nativeMiddleware.startedAt,
      },
      nativeMiddleware.error,
    );
  }

  #buildPipeCreateManyInput(
    callId: string,
    pipe: Pipe,
  ): Prisma.PipeCreateManyInput {
    return this.#withOptionalError(
      {
        call_id: callId,
        ended_at: pipe.endedAt,
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
    callId: string,
    response: Response,
  ): Prisma.ResponseCreateManyInput {
    return {
      aborted: response.aborted,
      call_id: callId,
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

  async #readSingleCallId(
    transaction: Prisma.TransactionClient,
    filter: CallsFilterQuery,
  ): Promise<string> {
    const matches: { id: string }[] = await transaction.call.findMany({
      select: {
        id: true,
      },
      where: this.#buildCallWhereInput(filter),
    });

    if (matches.length !== 1) {
      throw new Error(`Call update matched ${String(matches.length)} calls.`);
    }

    const match: { id: string } | undefined = matches[0];

    if (match === undefined) {
      throw new Error(`Call update matched ${String(matches.length)} calls.`);
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

  async #writeCallElements(
    transaction: Prisma.TransactionClient,
    call: Call,
  ): Promise<void> {
    const callId: string = call.id;
    const controller: Controller | undefined = call.controller;

    if (controller !== undefined) {
      await transaction.controller.createMany({
        data: [this.#buildControllerCreateManyInput(callId, controller)],
      });
    }

    if (call.guards.length > 0) {
      await transaction.guard.createMany({
        data: call.guards.map((guard: Guard): Prisma.GuardCreateManyInput =>
          this.#buildGuardCreateManyInput(callId, guard),
        ),
      });
    }

    if (call.httpErrors.length > 0) {
      await transaction.httpError.createMany({
        data: call.httpErrors.map(
          (httpError: HttpError): Prisma.HttpErrorCreateManyInput =>
            this.#buildHttpErrorCreateManyInput(callId, httpError),
        ),
      });
    }

    if (call.interceptors.length > 0) {
      await transaction.interceptor.createMany({
        data: call.interceptors.map(
          (interceptor: Interceptor): Prisma.InterceptorCreateManyInput =>
            this.#buildInterceptorCreateManyInput(callId, interceptor),
        ),
      });
    }

    if (call.middlewares.length > 0) {
      await transaction.middleware.createMany({
        data: call.middlewares.map(
          (middleware: Middleware): Prisma.MiddlewareCreateManyInput =>
            this.#buildMiddlewareCreateManyInput(callId, middleware),
        ),
      });
    }

    if (call.nativeMiddlewares.length > 0) {
      await transaction.nativeMiddleware.createMany({
        data: call.nativeMiddlewares.map(
          (
            nativeMiddleware: NativeMiddleware,
          ): Prisma.NativeMiddlewareCreateManyInput =>
            this.#buildNativeMiddlewareCreateManyInput(
              callId,
              nativeMiddleware,
            ),
        ),
      });
    }

    if (call.pipes.length > 0) {
      await transaction.pipe.createMany({
        data: call.pipes.map((pipe: Pipe): Prisma.PipeCreateManyInput =>
          this.#buildPipeCreateManyInput(callId, pipe),
        ),
      });
    }

    await transaction.response.createMany({
      data: [this.#buildResponseCreateManyInput(callId, call.response)],
    });
  }
}
