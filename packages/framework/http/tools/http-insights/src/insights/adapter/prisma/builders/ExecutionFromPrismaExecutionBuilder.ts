import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Prisma } from '../../../../generated/prisma/client.js';
import { type Execution } from '../../../domain/models/Execution.js';
import { ControllerFromPrismaControllerBuilder } from './ControllerFromPrismaControllerBuilder.js';
import { GuardFromPrismaGuardBuilder } from './GuardFromPrismaGuardBuilder.js';
import { HttpErrorFromPrismaHttpErrorBuilder } from './HttpErrorFromPrismaHttpErrorBuilder.js';
import { InterceptorFromPrismaInterceptorBuilder } from './InterceptorFromPrismaInterceptorBuilder.js';
import { MiddlewareFromPrismaMiddlewareBuilder } from './MiddlewareFromPrismaMiddlewareBuilder.js';
import { NativeMiddlewareFromPrismaNativeMiddlewareBuilder } from './NativeMiddlewareFromPrismaNativeMiddlewareBuilder.js';
import { PipeFromPrismaPipeBuilder } from './PipeFromPrismaPipeBuilder.js';
import { RequestFromPrismaRequestBuilder } from './RequestFromPrismaRequestBuilder.js';
import { ResponseFromPrismaResponseBuilder } from './ResponseFromPrismaResponseBuilder.js';

// eslint-disable-next-line @typescript-eslint/typedef
export const executionInclude = {
  controller: true,
  guards: { orderBy: { started_at: 'asc' } },
  httpErrors: { orderBy: { started_at: 'asc' } },
  interceptors: { orderBy: { started_at: 'asc' } },
  middlewares: { orderBy: { started_at: 'asc' } },
  nativeMiddlewares: { orderBy: { started_at: 'asc' } },
  pipes: { orderBy: { started_at: 'asc' } },
  request: true,
  response: true,
} satisfies Prisma.ExecutionInclude;

export type PrismaExecutionWithRelations = Prisma.ExecutionGetPayload<{
  include: typeof executionInclude;
}>;

@injectable()
export class ExecutionFromPrismaExecutionBuilder implements Builder<
  PrismaExecutionWithRelations,
  Execution
> {
  readonly #controllerFromPrismaControllerBuilder: ControllerFromPrismaControllerBuilder;
  readonly #guardFromPrismaGuardBuilder: GuardFromPrismaGuardBuilder;
  readonly #httpErrorFromPrismaHttpErrorBuilder: HttpErrorFromPrismaHttpErrorBuilder;
  readonly #interceptorFromPrismaInterceptorBuilder: InterceptorFromPrismaInterceptorBuilder;
  readonly #middlewareFromPrismaMiddlewareBuilder: MiddlewareFromPrismaMiddlewareBuilder;
  readonly #nativeMiddlewareFromPrismaNativeMiddlewareBuilder: NativeMiddlewareFromPrismaNativeMiddlewareBuilder;
  readonly #pipeFromPrismaPipeBuilder: PipeFromPrismaPipeBuilder;
  readonly #requestFromPrismaRequestBuilder: RequestFromPrismaRequestBuilder;
  readonly #responseFromPrismaResponseBuilder: ResponseFromPrismaResponseBuilder;

  constructor(
    @inject(ControllerFromPrismaControllerBuilder)
    controllerFromPrismaControllerBuilder: ControllerFromPrismaControllerBuilder,
    @inject(GuardFromPrismaGuardBuilder)
    guardFromPrismaGuardBuilder: GuardFromPrismaGuardBuilder,
    @inject(HttpErrorFromPrismaHttpErrorBuilder)
    httpErrorFromPrismaHttpErrorBuilder: HttpErrorFromPrismaHttpErrorBuilder,
    @inject(InterceptorFromPrismaInterceptorBuilder)
    interceptorFromPrismaInterceptorBuilder: InterceptorFromPrismaInterceptorBuilder,
    @inject(MiddlewareFromPrismaMiddlewareBuilder)
    middlewareFromPrismaMiddlewareBuilder: MiddlewareFromPrismaMiddlewareBuilder,
    @inject(NativeMiddlewareFromPrismaNativeMiddlewareBuilder)
    nativeMiddlewareFromPrismaNativeMiddlewareBuilder: NativeMiddlewareFromPrismaNativeMiddlewareBuilder,
    @inject(PipeFromPrismaPipeBuilder)
    pipeFromPrismaPipeBuilder: PipeFromPrismaPipeBuilder,
    @inject(RequestFromPrismaRequestBuilder)
    requestFromPrismaRequestBuilder: RequestFromPrismaRequestBuilder,
    @inject(ResponseFromPrismaResponseBuilder)
    responseFromPrismaResponseBuilder: ResponseFromPrismaResponseBuilder,
  ) {
    this.#controllerFromPrismaControllerBuilder =
      controllerFromPrismaControllerBuilder;
    this.#guardFromPrismaGuardBuilder = guardFromPrismaGuardBuilder;
    this.#httpErrorFromPrismaHttpErrorBuilder =
      httpErrorFromPrismaHttpErrorBuilder;
    this.#interceptorFromPrismaInterceptorBuilder =
      interceptorFromPrismaInterceptorBuilder;
    this.#middlewareFromPrismaMiddlewareBuilder =
      middlewareFromPrismaMiddlewareBuilder;
    this.#nativeMiddlewareFromPrismaNativeMiddlewareBuilder =
      nativeMiddlewareFromPrismaNativeMiddlewareBuilder;
    this.#pipeFromPrismaPipeBuilder = pipeFromPrismaPipeBuilder;
    this.#requestFromPrismaRequestBuilder = requestFromPrismaRequestBuilder;
    this.#responseFromPrismaResponseBuilder = responseFromPrismaResponseBuilder;
  }

  public build(input: PrismaExecutionWithRelations): Execution {
    return {
      controller: this.#controllerFromPrismaControllerBuilder.build(
        this.#requireRelation(input.id, 'controller', input.controller),
      ),
      guards: input.guards.map(
        (guard: Prisma.GuardGetPayload<Record<string, never>>) =>
          this.#guardFromPrismaGuardBuilder.build(guard),
      ),
      httpErrors: input.httpErrors.map(
        (httpError: Prisma.HttpErrorGetPayload<Record<string, never>>) =>
          this.#httpErrorFromPrismaHttpErrorBuilder.build(httpError),
      ),
      id: input.id,
      interceptors: input.interceptors.map(
        (interceptor: Prisma.InterceptorGetPayload<Record<string, never>>) =>
          this.#interceptorFromPrismaInterceptorBuilder.build(interceptor),
      ),
      middlewares: input.middlewares.map(
        (middleware: Prisma.MiddlewareGetPayload<Record<string, never>>) =>
          this.#middlewareFromPrismaMiddlewareBuilder.build(middleware),
      ),
      nativeMiddlewares: input.nativeMiddlewares.map(
        (
          nativeMiddleware: Prisma.NativeMiddlewareGetPayload<
            Record<string, never>
          >,
        ) =>
          this.#nativeMiddlewareFromPrismaNativeMiddlewareBuilder.build(
            nativeMiddleware,
          ),
      ),
      pipes: input.pipes.map(
        (pipe: Prisma.PipeGetPayload<Record<string, never>>) =>
          this.#pipeFromPrismaPipeBuilder.build(pipe),
      ),
      request: this.#requestFromPrismaRequestBuilder.build(
        this.#requireRelation(input.id, 'request', input.request),
      ),
      response: this.#responseFromPrismaResponseBuilder.build(
        this.#requireRelation(input.id, 'response', input.response),
      ),
    };
  }

  // Execution rows are written progressively as instrumentation events
  // arrive, so the relation can be `null` while an execution is in flight.
  // The adapter's query only selects executions where every relation below
  // is already present, so reaching `null` here signals a persistence
  // adapter query bug rather than an expected runtime state.
  #requireRelation<T>(
    executionId: string,
    relation: string,
    value: T | null,
  ): T {
    if (value === null) {
      throw new Error(
        `Execution "${executionId}" is missing its "${relation}" relation.`,
      );
    }

    return value;
  }
}
