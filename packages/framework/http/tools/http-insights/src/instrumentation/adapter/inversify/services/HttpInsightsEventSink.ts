import { randomUUID } from 'node:crypto';

import {
  type EventSink,
  type HttpControllerExecutedEvent,
  type HttpErrorEvent,
  type HttpGuardExecutedEvent,
  type HttpInstrumentationEvent,
  type HttpInterceptorExecutedEvent,
  type HttpMiddlewareExecutedEvent,
  type HttpNativeMiddlewareExecutedEvent,
  type HttpPipeExecutedEvent,
  type HttpRequestStartedEvent,
  type HttpResponseSentEvent,
} from '@inversifyjs/http-instrumentation-core';
import { inject, injectable } from 'inversify';

import { type ExecuteUpdateCommand } from '../../../../insights/application/models/ExecuteUpdateCommand.js';
import { ExecutionManagementInputPort } from '../../../../insights/application/ports/ExecutionManagementInputPort.js';
import { type Controller } from '../../../../insights/domain/models/Controller.js';
import { type Execution } from '../../../../insights/domain/models/Execution.js';
import { type Guard } from '../../../../insights/domain/models/Guard.js';
import { type HttpError } from '../../../../insights/domain/models/HttpError.js';
import { type Interceptor } from '../../../../insights/domain/models/Interceptor.js';
import { type Middleware } from '../../../../insights/domain/models/Middleware.js';
import { type NativeMiddleware } from '../../../../insights/domain/models/NativeMiddleware.js';
import { type Pipe } from '../../../../insights/domain/models/Pipe.js';
import { type Response } from '../../../../insights/domain/models/Response.js';

export const EXECUTION_RETENTION_MS: number = 60_000;
export const MAX_COMMITTED_EXECUTIONS: number = 10_000;
export const RETENTION_SWEEP_INTERVAL_MS: number = 5_000;

interface PendingExecution {
  readonly events: HttpInstrumentationEvent[];
  expiresAt: number | undefined;
  openStages: number;
  response: HttpResponseSentEvent | undefined;
}

interface CommittedExecution {
  readonly errors: HttpErrorEvent[];
  readonly executionId: string;
  readonly expiresAt: number;
}

interface InFlightWrite {
  stackedErrors: HttpErrorEvent[];
}

@injectable()
export class HttpInsightsEventSink implements EventSink<HttpInstrumentationEvent> {
  readonly #committedByRequestId: Map<string, CommittedExecution> = new Map();
  readonly #executionManagementInputPort: ExecutionManagementInputPort;
  readonly #inFlightByRequestId: Map<string, InFlightWrite> = new Map();
  readonly #pendingByRequestId: Map<string, PendingExecution> = new Map();
  #sweepTimer: ReturnType<typeof setInterval> | undefined;

  constructor(
    @inject(ExecutionManagementInputPort)
    executionManagementInputPort: ExecutionManagementInputPort,
  ) {
    this.#executionManagementInputPort = executionManagementInputPort;
    this.#sweepTimer = undefined;
  }

  public async emit(event: HttpInstrumentationEvent): Promise<void> {
    if (event.type === 'http.error') {
      await this.#emitHttpError(event);

      return;
    }

    const pending: PendingExecution = this.#readPending(event.requestId);

    if (event.type === 'http.response.sent') {
      pending.response = event;
    } else if (this.#isStageStarted(event)) {
      pending.openStages += 1;

      return;
    } else if (this.#isStageExecuted(event)) {
      pending.events.push(event);
      pending.openStages -= 1;
    } else if (event.type === 'http.request.started') {
      pending.events.push(event);
    } else {
      return;
    }

    await this.#persistIfComplete(event.requestId, pending);
  }

  #buildController(event: HttpControllerExecutedEvent): Controller {
    return {
      controller: event.controller,
      endedAt: new Date(event.timestamp),
      error: this.#readOptionalError(event),
      id: randomUUID(),
      method: event.method,
      startedAt: new Date(event.startedAt),
    };
  }

  #buildExecution(
    events: readonly HttpInstrumentationEvent[],
    responseEvent: HttpResponseSentEvent,
  ): Execution {
    const requestStarted: HttpRequestStartedEvent | undefined = events.find(
      (event: HttpInstrumentationEvent): event is HttpRequestStartedEvent =>
        event.type === 'http.request.started',
    );

    if (requestStarted === undefined) {
      throw new Error(
        `Cannot persist execution "${responseEvent.executionId}" without an http.request.started event.`,
      );
    }

    let controller: Controller | undefined;
    const guards: Guard[] = [];
    const httpErrors: HttpError[] = [];
    const interceptors: Interceptor[] = [];
    const middlewares: Middleware[] = [];
    const nativeMiddlewares: NativeMiddleware[] = [];
    const pipes: Pipe[] = [];

    for (const event of events) {
      switch (event.type) {
        case 'http.controller.executed':
          controller = this.#buildController(event);
          break;
        case 'http.error':
          httpErrors.push(this.#buildHttpError(event));
          break;
        case 'http.guard.executed':
          guards.push(this.#buildGuard(event));
          break;
        case 'http.interceptor.executed':
          interceptors.push(this.#buildInterceptor(event));
          break;
        case 'http.middleware.executed':
          middlewares.push(this.#buildMiddleware(event));
          break;
        case 'http.nativeMiddleware.executed':
          nativeMiddlewares.push(this.#buildNativeMiddleware(event));
          break;
        case 'http.pipe.executed':
          pipes.push(this.#buildPipe(event));
          break;
        default:
          break;
      }
    }

    return {
      controller,
      guards,
      httpErrors,
      id: requestStarted.executionId,
      interceptors,
      middlewares,
      nativeMiddlewares,
      pipes,
      request: {
        headers: requestStarted.headers,
        id: requestStarted.requestId,
        method: requestStarted.method,
        startedAt: new Date(requestStarted.timestamp),
        url: requestStarted.url,
      },
      response: this.#buildResponse(responseEvent),
    };
  }

  #buildGuard(event: HttpGuardExecutedEvent): Guard {
    return {
      allowed: event.allowed ?? null,
      endedAt: new Date(event.timestamp),
      error: this.#readOptionalError(event),
      guard: event.guard,
      id: randomUUID(),
      startedAt: new Date(event.startedAt),
    };
  }

  #buildHttpError(event: HttpErrorEvent): HttpError {
    return {
      endedAt: new Date(event.timestamp),
      error: event.error,
      filter: event.filter ?? null,
      id: randomUUID(),
      startedAt: new Date(event.startedAt),
    };
  }

  #buildInterceptor(event: HttpInterceptorExecutedEvent): Interceptor {
    return {
      endedAt: new Date(event.timestamp),
      error: this.#readOptionalError(event),
      id: randomUUID(),
      interceptor: event.interceptor,
      startedAt: new Date(event.startedAt),
    };
  }

  #buildMiddleware(event: HttpMiddlewareExecutedEvent): Middleware {
    return {
      endedAt: new Date(event.timestamp),
      error: this.#readOptionalError(event),
      id: randomUUID(),
      middleware: event.middleware,
      phase: event.phase,
      startedAt: new Date(event.startedAt),
    };
  }

  #buildNativeMiddleware(
    event: HttpNativeMiddlewareExecutedEvent,
  ): NativeMiddleware {
    return {
      endedAt: new Date(event.timestamp),
      error: this.#readOptionalError(event),
      id: randomUUID(),
      name: event.name,
      startedAt: new Date(event.startedAt),
    };
  }

  #buildPipe(event: HttpPipeExecutedEvent): Pipe {
    return {
      endedAt: new Date(event.timestamp),
      error: this.#readOptionalError(event),
      id: randomUUID(),
      method: event.method,
      parameterIndex: event.parameterIndex,
      pipe: event.pipe,
      startedAt: new Date(event.startedAt),
    };
  }

  #buildResponse(event: HttpResponseSentEvent): Response {
    return {
      aborted: event.aborted,
      headers: event.headers,
      id: randomUUID(),
      sentAt: new Date(event.timestamp),
      statusCode: event.statusCode,
    };
  }

  #isStageExecuted(event: HttpInstrumentationEvent): boolean {
    switch (event.type) {
      case 'http.controller.executed':
      case 'http.guard.executed':
      case 'http.interceptor.executed':
      case 'http.middleware.executed':
      case 'http.nativeMiddleware.executed':
      case 'http.pipe.executed':
        return true;
      default:
        return false;
    }
  }

  #isStageStarted(event: HttpInstrumentationEvent): boolean {
    switch (event.type) {
      case 'http.controller.started':
      case 'http.guard.started':
      case 'http.interceptor.started':
      case 'http.middleware.started':
      case 'http.nativeMiddleware.started':
      case 'http.pipe.started':
        return true;
      default:
        return false;
    }
  }

  async #drainErrors(
    errors: HttpErrorEvent[],
    executionId: string,
  ): Promise<void> {
    while (errors.length > 0) {
      const batch: HttpErrorEvent[] = errors.splice(0, errors.length);

      try {
        await this.#updateHttpErrors(
          executionId,
          batch.map((errorEvent: HttpErrorEvent): HttpError =>
            this.#buildHttpError(errorEvent),
          ),
        );
      } catch (error: unknown) {
        errors.unshift(...batch);

        throw error;
      }
    }
  }

  async #emitHttpError(event: HttpErrorEvent): Promise<void> {
    const inFlight: InFlightWrite | undefined = this.#inFlightByRequestId.get(
      event.requestId,
    );

    if (inFlight !== undefined) {
      inFlight.stackedErrors.push(event);

      return;
    }

    const pending: PendingExecution | undefined = this.#pendingByRequestId.get(
      event.requestId,
    );

    if (pending !== undefined) {
      pending.events.push(event);
      await this.#persistIfComplete(event.requestId, pending);

      return;
    }

    const committed: CommittedExecution | undefined =
      this.#committedByRequestId.get(event.requestId);

    if (committed === undefined) {
      return;
    }

    committed.errors.push(event);
    await this.#followCommittedWrite(event.requestId, committed);
  }

  async #followCommittedWrite(
    requestId: string,
    committed: CommittedExecution,
  ): Promise<void> {
    const inFlight: InFlightWrite = {
      stackedErrors: committed.errors,
    };

    this.#inFlightByRequestId.set(requestId, inFlight);

    try {
      await this.#drainErrors(committed.errors, committed.executionId);
    } finally {
      this.#inFlightByRequestId.delete(requestId);
    }
  }

  #armRetentionSweep(): void {
    if (this.#sweepTimer !== undefined) {
      return;
    }

    const sweepTimer: ReturnType<typeof setInterval> = setInterval((): void => {
      this.#sweepExpiredExecutions();
    }, RETENTION_SWEEP_INTERVAL_MS);

    sweepTimer.unref();
    this.#sweepTimer = sweepTimer;
  }

  #disarmRetentionSweep(): void {
    if (this.#sweepTimer === undefined) {
      return;
    }

    clearInterval(this.#sweepTimer);
    this.#sweepTimer = undefined;
  }

  #evictCommittedOverflow(): void {
    let overflow: number =
      this.#committedByRequestId.size - MAX_COMMITTED_EXECUTIONS;

    if (overflow <= 0) {
      return;
    }

    for (const requestId of this.#committedByRequestId.keys()) {
      if (overflow <= 0) {
        return;
      }

      if (this.#inFlightByRequestId.has(requestId)) {
        continue;
      }

      this.#committedByRequestId.delete(requestId);
      overflow -= 1;
    }
  }

  #rememberCommitted(requestId: string, committed: CommittedExecution): void {
    this.#committedByRequestId.set(requestId, committed);
    this.#evictCommittedOverflow();
    this.#armRetentionSweep();
  }

  #retainFailedPending(pending: PendingExecution): void {
    pending.expiresAt = Date.now() + EXECUTION_RETENTION_MS;
    this.#armRetentionSweep();
  }

  #stopRetentionSweepIfIdle(): void {
    if (this.#committedByRequestId.size > 0) {
      return;
    }

    for (const pending of this.#pendingByRequestId.values()) {
      if (pending.expiresAt !== undefined) {
        return;
      }
    }

    this.#disarmRetentionSweep();
  }

  #sweepExpiredExecutions(): void {
    const now: number = Date.now();

    for (const [requestId, committed] of this.#committedByRequestId) {
      if (
        committed.expiresAt > now ||
        this.#inFlightByRequestId.has(requestId)
      ) {
        continue;
      }

      this.#committedByRequestId.delete(requestId);
    }

    for (const [requestId, pending] of this.#pendingByRequestId) {
      if (
        pending.expiresAt === undefined ||
        pending.expiresAt > now ||
        this.#inFlightByRequestId.has(requestId)
      ) {
        continue;
      }

      this.#pendingByRequestId.delete(requestId);
    }

    this.#evictCommittedOverflow();
    this.#stopRetentionSweepIfIdle();
  }

  async #persistIfComplete(
    requestId: string,
    pending: PendingExecution,
  ): Promise<void> {
    if (
      this.#inFlightByRequestId.has(requestId) ||
      pending.response === undefined ||
      pending.openStages > 0
    ) {
      return;
    }

    const response: HttpResponseSentEvent = pending.response;
    let execution: Execution;

    try {
      execution = this.#buildExecution(pending.events.slice(), response);
    } catch (error: unknown) {
      this.#pendingByRequestId.delete(requestId);

      throw error;
    }

    const inFlight: InFlightWrite = {
      stackedErrors: [],
    };

    this.#inFlightByRequestId.set(requestId, inFlight);

    try {
      await this.#executionManagementInputPort.create(execution);

      const committed: CommittedExecution = {
        errors: inFlight.stackedErrors,
        executionId: execution.id,
        expiresAt: Date.now() + EXECUTION_RETENTION_MS,
      };

      this.#pendingByRequestId.delete(requestId);
      this.#rememberCommitted(requestId, committed);
      await this.#drainErrors(committed.errors, committed.executionId);
    } catch (error: unknown) {
      if (!this.#committedByRequestId.has(requestId)) {
        pending.events.push(...inFlight.stackedErrors);
        inFlight.stackedErrors.length = 0;
        this.#retainFailedPending(pending);
      }

      throw error;
    } finally {
      this.#inFlightByRequestId.delete(requestId);
    }
  }

  async #updateHttpErrors(
    executionId: string,
    httpErrors: readonly HttpError[],
  ): Promise<void> {
    const command: ExecuteUpdateCommand = {
      filter: {
        id: executionId,
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
        httpErrors,
      },
    };

    await this.#executionManagementInputPort.update(command);
  }

  #readOptionalError(event: { readonly error?: unknown }): unknown {
    if ('error' in event) {
      return event.error;
    }

    return null;
  }

  #readPending(requestId: string): PendingExecution {
    const pending: PendingExecution | undefined =
      this.#pendingByRequestId.get(requestId);

    if (pending !== undefined) {
      return pending;
    }

    const created: PendingExecution = {
      events: [],
      expiresAt: undefined,
      openStages: 0,
      response: undefined,
    };

    this.#pendingByRequestId.set(requestId, created);

    return created;
  }
}
