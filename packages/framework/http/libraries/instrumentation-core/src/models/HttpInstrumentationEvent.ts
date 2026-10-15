import { type MiddlewarePhase } from '@inversifyjs/framework-core';

export interface BaseEvent<TType extends string> {
  readonly executionId: string;
  readonly parentExecutionId?: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly type: TType;
}

export interface HttpControllerExecutedEvent extends BaseEvent<'http.controller.executed'> {
  readonly controller: string;
  readonly duration: number;
  readonly error?: unknown;
  readonly method: string;
  readonly startedAt: number;
}

export interface HttpControllerStartedEvent extends BaseEvent<'http.controller.started'> {
  readonly controller: string;
  readonly method: string;
}

export interface HttpErrorEvent extends BaseEvent<'http.error'> {
  readonly duration: number;
  readonly error: unknown;
  readonly filter?: string;
  readonly startedAt: number;
}

export interface HttpGuardExecutedEvent extends BaseEvent<'http.guard.executed'> {
  readonly allowed?: boolean;
  readonly duration: number;
  readonly error?: unknown;
  readonly guard: string;
  readonly startedAt: number;
}

export interface HttpGuardStartedEvent extends BaseEvent<'http.guard.started'> {
  readonly guard: string;
}

export interface HttpInterceptorExecutedEvent extends BaseEvent<'http.interceptor.executed'> {
  readonly duration: number;
  readonly error?: unknown;
  readonly interceptor: string;
  readonly startedAt: number;
}

export interface HttpInterceptorStartedEvent extends BaseEvent<'http.interceptor.started'> {
  readonly interceptor: string;
}

export interface HttpMiddlewareExecutedEvent extends BaseEvent<'http.middleware.executed'> {
  readonly duration: number;
  readonly error?: unknown;
  readonly middleware: string;
  readonly phase: MiddlewarePhase;
  readonly startedAt: number;
}

export interface HttpMiddlewareStartedEvent extends BaseEvent<'http.middleware.started'> {
  readonly middleware: string;
  readonly phase: MiddlewarePhase;
}

export interface HttpNativeMiddlewareExecutedEvent extends BaseEvent<'http.nativeMiddleware.executed'> {
  readonly duration: number;
  readonly error?: unknown;
  readonly name: string;
  readonly startedAt: number;
}

export interface HttpNativeMiddlewareStartedEvent extends BaseEvent<'http.nativeMiddleware.started'> {
  readonly name: string;
}

export interface HttpPipeExecutedEvent extends BaseEvent<'http.pipe.executed'> {
  readonly duration: number;
  readonly error?: unknown;
  readonly method: string;
  readonly parameterIndex: number;
  readonly pipe: string;
  readonly startedAt: number;
}

export interface HttpPipeStartedEvent extends BaseEvent<'http.pipe.started'> {
  readonly method: string;
  readonly parameterIndex: number;
  readonly pipe: string;
}

export interface HttpRequestStartedEvent extends BaseEvent<'http.request.started'> {
  readonly headers: Readonly<Record<string, string | readonly string[]>>;
  readonly method: string;
  readonly url: string;
}

export interface HttpResponseSentEvent extends BaseEvent<'http.response.sent'> {
  readonly aborted: boolean;
  readonly duration: number;
  readonly headers: Readonly<Record<string, string | readonly string[]>>;
  readonly startedAt: number;
  readonly statusCode: number;
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
