import { randomUUID } from 'node:crypto';

import {
  closeHttpInstrumentationScope,
  emitHttpInstrumentationEvent,
  type HttpInstrumentationContext,
  type HttpStageClock,
  initializeHttpInstrumentationRequest,
  isHttpInstrumentedHandler,
  openHttpInstrumentationScope,
  readHttpStageDuration,
  redactHttpHeaders,
  startHttpStage,
} from '@inversifyjs/http-instrumentation-core';
import {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

const EXPRESS_ERROR_HANDLER_LENGTH: number = 4;
const ANONYMOUS_EXPRESS_LAYER_NAME: string = '<anonymous>';
const ANONYMOUS_MIDDLEWARE_NAME: string = 'anonymous';

const expressInstrumentedMiddlewareSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-express/instrumentedMiddleware',
);
const expressRegistrationPatchedSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-express/registrationPatched',
);

const EXPRESS_REGISTRATION_METHODS: readonly string[] = [
  'all',
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'use',
];

type ExpressLayerHandler = (
  errorOrRequest: unknown,
  requestOrResponse: Request | Response,
  responseOrNext: Response | NextFunction,
  next?: NextFunction,
) => unknown;

interface ExpressApplicationLike {
  handle: unknown;
  set: unknown;
}

interface ExpressRouterLike {
  stack: unknown[];
  use: (...args: unknown[]) => unknown;
}

interface ExpressRouteLike {
  stack: unknown[];
}

type ExpressRegistration = (this: unknown, ...args: unknown[]) => unknown;

interface ExpressApplicationDispatch {
  handle: (
    request: Request,
    response: Response,
    callback?: (error?: unknown) => void,
  ) => void;
}

export function installExpressHttpInstrumentation(
  app: Application,
  instrumentation: HttpInstrumentationContext,
): void {
  patchExpressRegistrations(app, instrumentation);
  installExpressRequestObservation(app, instrumentation);
}

function installExpressRequestObservation(
  app: Application,
  instrumentation: HttpInstrumentationContext,
): void {
  const application: ExpressApplicationDispatch =
    app as unknown as ExpressApplicationDispatch;

  if (isExpressRegistrationPatched(application.handle)) {
    return;
  }

  const originalHandle: ExpressApplicationDispatch['handle'] =
    application.handle.bind(app);

  const observedHandle: ExpressApplicationDispatch['handle'] = (
    request: Request,
    response: Response,
    callback?: (error?: unknown) => void,
  ): void => {
    observeExpressRequest(request, response, instrumentation);
    originalHandle(request, response, callback);
  };

  markExpressRegistrationPatched(observedHandle);
  application.handle = observedHandle;
}

function observeExpressRequest(
  request: Request,
  response: Response,
  instrumentation: HttpInstrumentationContext,
): void {
  const requestId: string = randomUUID();
  const stage: HttpStageClock = startHttpStage();

  initializeHttpInstrumentationRequest(request, requestId);

  const scope: ReturnType<typeof openHttpInstrumentationScope> =
    openHttpInstrumentationScope(request, randomUUID());

  emitHttpInstrumentationEvent(
    instrumentation.sinks,
    {
      executionId: scope.executionId,
      headers: redactHttpHeaders(request.headers),
      method: request.method,
      requestId: scope.requestId,
      timestamp: stage.startedAt,
      type: 'http.request.started',
      url: readExpressRequestUrl(request),
    },
    instrumentation.reportSinkError,
  );

  let completed: boolean = false;
  const complete: (aborted: boolean) => void = (aborted: boolean): void => {
    if (completed) {
      return;
    }

    completed = true;

    emitHttpInstrumentationEvent(
      instrumentation.sinks,
      {
        aborted,
        duration: readHttpStageDuration(stage),
        executionId: scope.executionId,
        headers: redactHttpHeaders(response.getHeaders()),
        requestId: scope.requestId,
        startedAt: stage.startedAt,
        statusCode: response.statusCode,
        timestamp: Date.now(),
        type: 'http.response.sent',
      },
      instrumentation.reportSinkError,
    );
    closeHttpInstrumentationScope(request, scope.executionId);
  };

  response.once('finish', (): void => {
    complete(false);
  });
  response.once('close', (): void => {
    if (!response.writableFinished) {
      complete(true);
    }
  });
}

function patchExpressRegistrations(
  target: object,
  instrumentation: HttpInstrumentationContext,
): void {
  const record: Record<string, unknown> = target as Record<string, unknown>;

  for (const methodName of EXPRESS_REGISTRATION_METHODS) {
    const original: unknown = record[methodName];

    if (
      typeof original !== 'function' ||
      isExpressRegistrationPatched(original)
    ) {
      continue;
    }

    const patched: ExpressRegistration = function (
      this: unknown,
      ...args: unknown[]
    ): unknown {
      return (original as ExpressRegistration).apply(
        this,
        instrumentRegistrationArguments(args, instrumentation),
      );
    };

    markExpressRegistrationPatched(patched);
    record[methodName] = patched;
  }

  const originalRoute: unknown = record['route'];

  if (
    typeof originalRoute !== 'function' ||
    isExpressRegistrationPatched(originalRoute)
  ) {
    return;
  }

  const patchedRoute: ExpressRegistration = function (
    this: unknown,
    ...args: unknown[]
  ): unknown {
    const route: unknown = (originalRoute as ExpressRegistration).apply(
      this,
      args,
    );

    if (isExpressRoute(route)) {
      patchExpressRegistrations(route, instrumentation);
    }

    return route;
  };

  markExpressRegistrationPatched(patchedRoute);
  record['route'] = patchedRoute;
}

function instrumentRegistrationArguments(
  args: readonly unknown[],
  instrumentation: HttpInstrumentationContext,
): unknown[] {
  return args.map((argument: unknown): unknown =>
    instrumentRegistrationArgument(argument, instrumentation),
  );
}

function instrumentRegistrationArgument(
  argument: unknown,
  instrumentation: HttpInstrumentationContext,
): unknown {
  if (isExpressRouter(argument)) {
    patchExpressRegistrations(argument, instrumentation);

    const handler: ExpressLayerHandler =
      argument as unknown as ExpressLayerHandler;

    return wrapExpressMiddleware(
      describeExpressHandler(handler, 'router'),
      handler,
      instrumentation,
    );
  }

  if (isExpressApplication(argument)) {
    patchExpressRegistrations(argument, instrumentation);

    return argument;
  }

  if (typeof argument !== 'function') {
    return argument;
  }

  if (
    isHttpInstrumentedHandler(argument) ||
    isExpressInstrumentedMiddleware(argument)
  ) {
    return argument;
  }

  const handler: ExpressLayerHandler = argument as ExpressLayerHandler;

  return wrapExpressMiddleware(
    describeExpressHandler(handler, ANONYMOUS_MIDDLEWARE_NAME),
    handler,
    instrumentation,
  );
}

function wrapExpressMiddleware(
  name: string,
  handler: ExpressLayerHandler,
  instrumentation: HttpInstrumentationContext,
): ExpressLayerHandler {
  const wrapped: ExpressLayerHandler = (
    handler.length >= EXPRESS_ERROR_HANDLER_LENGTH
      ? (
          error: unknown,
          request: Request,
          response: Response,
          next: NextFunction,
        ): unknown =>
          runExpressMiddleware(
            name,
            request,
            response,
            instrumentation,
            (wrappedNext: NextFunction): unknown =>
              handler(error, request, response, wrappedNext),
            next,
          )
      : (request: Request, response: Response, next: NextFunction): unknown =>
          runExpressMiddleware(
            name,
            request,
            response,
            instrumentation,
            (wrappedNext: NextFunction): unknown =>
              handler(request, response, wrappedNext),
            next,
          )
  ) as ExpressLayerHandler;

  markExpressInstrumentedMiddleware(wrapped);

  return wrapped;
}

function runExpressMiddleware(
  name: string,
  request: Request,
  response: Response,
  instrumentation: HttpInstrumentationContext,
  invoke: (next: NextFunction) => unknown,
  next: NextFunction,
): unknown {
  const stage: HttpStageClock = startHttpStage();
  const scope: ReturnType<typeof openHttpInstrumentationScope> =
    openHttpInstrumentationScope(request, randomUUID());
  let settled: boolean = false;
  const handoff: { continued: boolean } = { continued: false };

  const finish: (error?: unknown) => void = (error?: unknown): void => {
    if (settled) {
      return;
    }

    settled = true;

    emitHttpInstrumentationEvent(
      instrumentation.sinks,
      {
        duration: readHttpStageDuration(stage),
        ...(error === undefined ? {} : { error }),
        executionId: scope.executionId,
        name,
        ...(scope.parentExecutionId === undefined
          ? {}
          : { parentExecutionId: scope.parentExecutionId }),
        requestId: scope.requestId,
        startedAt: stage.startedAt,
        timestamp: Date.now(),
        type: 'http.nativeMiddleware.executed',
      },
      instrumentation.reportSinkError,
    );
    closeHttpInstrumentationScope(request, scope.executionId);
  };

  const finishWhenResponseEnds: () => void = (): void => {
    if (response.writableFinished) {
      finish();

      return;
    }

    response.once('finish', (): void => {
      finish();
    });
    response.once('close', (): void => {
      if (!response.writableFinished) {
        finish();
      }
    });
  };

  const wrappedNext: NextFunction = (error?: unknown): void => {
    if (!handoff.continued) {
      handoff.continued = true;
      finishWhenResponseEnds();
    }

    next(error);
  };

  emitHttpInstrumentationEvent(
    instrumentation.sinks,
    {
      executionId: scope.executionId,
      name,
      ...(scope.parentExecutionId === undefined
        ? {}
        : { parentExecutionId: scope.parentExecutionId }),
      requestId: scope.requestId,
      timestamp: stage.startedAt,
      type: 'http.nativeMiddleware.started',
    },
    instrumentation.reportSinkError,
  );

  try {
    const result: unknown = invoke(wrappedNext);

    if (isPromise(result)) {
      return result.then(
        (value: unknown): unknown => {
          if (!handoff.continued) {
            finish();
          }

          return value;
        },
        (error: unknown): never => {
          if (!handoff.continued) {
            finish(error);
          }

          throw error;
        },
      );
    }

    if (!handoff.continued) {
      finish();
    }

    return result;
  } catch (error: unknown) {
    if (!handoff.continued) {
      finish(error);
    }

    throw error;
  }
}

function describeExpressHandler(
  handler: ExpressLayerHandler,
  fallbackName: string,
): string {
  if (handler.name !== '') {
    return handler.name;
  }

  if (
    fallbackName !== '' &&
    fallbackName !== ANONYMOUS_EXPRESS_LAYER_NAME &&
    fallbackName !== ANONYMOUS_MIDDLEWARE_NAME
  ) {
    return fallbackName;
  }

  return ANONYMOUS_MIDDLEWARE_NAME;
}

function readExpressRequestUrl(request: Request): string {
  if (typeof request.originalUrl === 'string' && request.originalUrl !== '') {
    return request.originalUrl;
  }

  return request.url;
}

function isExpressApplication(value: unknown): value is ExpressApplicationLike {
  if (typeof value !== 'function') {
    return false;
  }

  const application: Partial<ExpressApplicationLike> =
    value as Partial<ExpressApplicationLike>;

  return (
    typeof application.handle === 'function' &&
    typeof application.set === 'function'
  );
}

function isExpressRouter(value: unknown): value is ExpressRouterLike {
  if (typeof value !== 'function') {
    return false;
  }

  const router: Partial<ExpressRouterLike> =
    value as Partial<ExpressRouterLike>;

  return Array.isArray(router.stack) && typeof router.use === 'function';
}

function isExpressRoute(value: unknown): value is ExpressRouteLike {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const route: Partial<ExpressRouteLike> & { get?: unknown } = value;

  return Array.isArray(route.stack) && typeof route.get === 'function';
}

function isPromise(value: unknown): value is Promise<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function markExpressInstrumentedMiddleware(handler: object): void {
  Object.defineProperty(handler, expressInstrumentedMiddlewareSymbol, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
}

function isExpressInstrumentedMiddleware(handler: object): boolean {
  const record: Record<symbol, unknown> = handler as Record<symbol, unknown>;

  return record[expressInstrumentedMiddlewareSymbol] === true;
}

function markExpressRegistrationPatched(handler: object): void {
  Object.defineProperty(handler, expressRegistrationPatchedSymbol, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
}

function isExpressRegistrationPatched(handler: object): boolean {
  const record: Record<symbol, unknown> = handler as Record<symbol, unknown>;

  return record[expressRegistrationPatchedSymbol] === true;
}
