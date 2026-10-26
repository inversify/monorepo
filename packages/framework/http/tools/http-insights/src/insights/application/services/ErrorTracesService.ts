import { inject, injectable } from 'inversify';

import { type Call } from '../../domain/models/Call.js';
import { type Controller } from '../../domain/models/Controller.js';
import { type ErrorTrace } from '../../domain/models/ErrorTrace.js';
import { type Guard } from '../../domain/models/Guard.js';
import { type HttpError } from '../../domain/models/HttpError.js';
import { type Interceptor } from '../../domain/models/Interceptor.js';
import { type Middleware } from '../../domain/models/Middleware.js';
import { type NativeMiddleware } from '../../domain/models/NativeMiddleware.js';
import { type Pipe } from '../../domain/models/Pipe.js';
import { type ExecuteUpdateCommand } from '../models/ExecuteUpdateCommand.js';
import {
  type ErrorTracesReader,
  errorTracesReaderService,
} from '../ports/ErrorTracesReader.js';

interface Traceable {
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
}

@injectable()
export class ErrorTracesService {
  readonly #errorTracesReader: ErrorTracesReader;

  constructor(
    @inject(errorTracesReaderService)
    errorTracesReader: ErrorTracesReader,
  ) {
    this.#errorTracesReader = errorTracesReader;
  }

  public async capture(call: Call): Promise<Call> {
    const tracesByError: ReadonlyMap<unknown, readonly ErrorTrace[] | null> =
      await this.#readTraces(collectCallErrors(call));
    const controller: Controller | undefined = call.controller;

    return {
      ...call,
      controller:
        controller === undefined
          ? undefined
          : withErrorTraces(controller, tracesByError),
      guards: call.guards.map((guard: Guard): Guard =>
        withErrorTraces(guard, tracesByError),
      ),
      httpErrors: call.httpErrors.map((httpError: HttpError): HttpError =>
        withErrorTraces(httpError, tracesByError),
      ),
      interceptors: call.interceptors.map(
        (interceptor: Interceptor): Interceptor =>
          withErrorTraces(interceptor, tracesByError),
      ),
      middlewares: call.middlewares.map((middleware: Middleware): Middleware =>
        withErrorTraces(middleware, tracesByError),
      ),
      nativeMiddlewares: call.nativeMiddlewares.map(
        (nativeMiddleware: NativeMiddleware): NativeMiddleware =>
          withErrorTraces(nativeMiddleware, tracesByError),
      ),
      pipes: call.pipes.map((pipe: Pipe): Pipe =>
        withErrorTraces(pipe, tracesByError),
      ),
    };
  }

  public async captureUpdate(
    command: ExecuteUpdateCommand,
  ): Promise<ExecuteUpdateCommand> {
    const tracesByError: ReadonlyMap<unknown, readonly ErrorTrace[] | null> =
      await this.#readTraces(
        command.set.httpErrors.map(
          (httpError: HttpError): unknown => httpError.error,
        ),
      );

    return {
      filter: command.filter,
      set: {
        httpErrors: command.set.httpErrors.map(
          (httpError: HttpError): HttpError =>
            withErrorTraces(httpError, tracesByError),
        ),
      },
    };
  }

  async #readTraces(
    errors: readonly unknown[],
  ): Promise<ReadonlyMap<unknown, readonly ErrorTrace[] | null>> {
    const uniqueErrors: unknown[] = [];

    for (const error of errors) {
      if (
        error === null ||
        error === undefined ||
        uniqueErrors.includes(error)
      ) {
        continue;
      }

      uniqueErrors.push(error);
    }

    const entries: ReadonlyArray<
      readonly [unknown, readonly ErrorTrace[] | null]
    > = await Promise.all(
      uniqueErrors.map(
        async (
          error: unknown,
        ): Promise<readonly [unknown, readonly ErrorTrace[] | null]> => [
          error,
          await this.#errorTracesReader.read(error),
        ],
      ),
    );

    return new Map(entries);
  }
}

function collectCallErrors(call: Call): readonly unknown[] {
  const errors: unknown[] = [];
  const controller: Controller | undefined = call.controller;

  if (controller !== undefined) {
    errors.push(controller.error);
  }

  for (const guard of call.guards) {
    errors.push(guard.error);
  }

  for (const httpError of call.httpErrors) {
    errors.push(httpError.error);
  }

  for (const interceptor of call.interceptors) {
    errors.push(interceptor.error);
  }

  for (const middleware of call.middlewares) {
    errors.push(middleware.error);
  }

  for (const nativeMiddleware of call.nativeMiddlewares) {
    errors.push(nativeMiddleware.error);
  }

  for (const pipe of call.pipes) {
    errors.push(pipe.error);
  }

  return errors;
}

function readStoredTraces(
  tracesByError: ReadonlyMap<unknown, readonly ErrorTrace[] | null>,
  error: unknown,
): readonly ErrorTrace[] | null {
  if (error === null || error === undefined) {
    return null;
  }

  return tracesByError.get(error) ?? null;
}

function withErrorTraces<T extends Traceable>(
  entity: T,
  tracesByError: ReadonlyMap<unknown, readonly ErrorTrace[] | null>,
): T {
  return {
    ...entity,
    errorTraces: readStoredTraces(tracesByError, entity.error),
  };
}
