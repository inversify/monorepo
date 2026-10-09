import { type MiddlewarePhase } from '@inversifyjs/framework-core';

interface HttpControllerExecutedEvent {
  readonly controller: string;
  readonly duration: number;
  readonly error?: unknown;
  readonly executionId: string;
  readonly method: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.controller.executed';
}

interface HttpControllerStartedEvent {
  readonly controller: string;
  readonly executionId: string;
  readonly method: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.controller.started';
}

interface HttpErrorEvent {
  readonly duration: number;
  readonly error: unknown;
  readonly executionId: string;
  readonly filter?: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.error';
}

interface HttpGuardExecutedEvent {
  readonly allowed?: boolean;
  readonly duration: number;
  readonly error?: unknown;
  readonly executionId: string;
  readonly guard: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.guard.executed';
}

interface HttpGuardStartedEvent {
  readonly executionId: string;
  readonly guard: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.guard.started';
}

interface HttpInterceptorExecutedEvent {
  readonly duration: number;
  readonly error?: unknown;
  readonly executionId: string;
  readonly interceptor: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.interceptor.executed';
}

interface HttpInterceptorStartedEvent {
  readonly executionId: string;
  readonly interceptor: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.interceptor.started';
}

interface HttpMiddlewareExecutedEvent {
  readonly duration: number;
  readonly error?: unknown;
  readonly executionId: string;
  readonly middleware: string;
  readonly parentExecutionId?: string;
  readonly phase: MiddlewarePhase;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.middleware.executed';
}

interface HttpMiddlewareStartedEvent {
  readonly executionId: string;
  readonly middleware: string;
  readonly parentExecutionId?: string;
  readonly phase: MiddlewarePhase;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.middleware.started';
}

interface HttpNativeMiddlewareExecutedEvent {
  readonly duration: number;
  readonly error?: unknown;
  readonly executionId: string;
  readonly name: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.nativeMiddleware.executed';
}

interface HttpNativeMiddlewareStartedEvent {
  readonly executionId: string;
  readonly name: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.nativeMiddleware.started';
}

interface HttpPipeExecutedEvent {
  readonly duration: number;
  readonly error?: unknown;
  readonly executionId: string;
  readonly method: string;
  readonly parameterIndex: number;
  readonly parentExecutionId?: string;
  readonly pipe: string;
  readonly requestId: string;
  readonly startedAt: number;
  readonly timestamp: number;
  readonly type: 'http.pipe.executed';
}

interface HttpPipeStartedEvent {
  readonly executionId: string;
  readonly method: string;
  readonly parameterIndex: number;
  readonly parentExecutionId?: string;
  readonly pipe: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.pipe.started';
}

interface HttpRequestStartedEvent {
  readonly executionId: string;
  readonly headers: Readonly<Record<string, string | readonly string[]>>;
  readonly method: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: 'http.request.started';
  readonly url: string;
}

interface HttpResponseSentEvent {
  readonly aborted: boolean;
  readonly duration: number;
  readonly executionId: string;
  readonly headers: Readonly<Record<string, string | readonly string[]>>;
  readonly requestId: string;
  readonly startedAt: number;
  readonly statusCode: number;
  readonly timestamp: number;
  readonly type: 'http.response.sent';
}

export type HttpInstrumentationEvent =
  | HttpControllerExecutedEvent
  | HttpControllerStartedEvent
  | HttpErrorEvent
  | HttpGuardExecutedEvent
  | HttpGuardStartedEvent
  | HttpInterceptorExecutedEvent
  | HttpInterceptorStartedEvent
  | HttpMiddlewareExecutedEvent
  | HttpMiddlewareStartedEvent
  | HttpNativeMiddlewareExecutedEvent
  | HttpNativeMiddlewareStartedEvent
  | HttpPipeExecutedEvent
  | HttpPipeStartedEvent
  | HttpRequestStartedEvent
  | HttpResponseSentEvent;
