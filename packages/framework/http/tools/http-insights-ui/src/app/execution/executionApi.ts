import { durationMs } from '../executions/durationMs.js';

const EXECUTIONS_PATH: string = '/.inversify/v1/executions';

export interface HeaderEntry {
  readonly name: string;
  readonly value: string;
}

export interface TimedStage {
  readonly durationMs: number;
  readonly endedAt: string;
  readonly error: string | undefined;
  readonly id: string;
  readonly startedAt: string;
}

export interface MiddlewareDetail extends TimedStage {
  readonly name: string;
  readonly phase: string;
}

export interface NativeMiddlewareDetail extends TimedStage {
  readonly name: string;
}

export interface GuardDetail extends TimedStage {
  readonly allowed: boolean | null;
  readonly name: string;
}

export interface ControllerDetail extends TimedStage {
  readonly method: string;
  readonly name: string;
}

export interface InterceptorDetail extends TimedStage {
  readonly name: string;
}

export interface PipeDetail extends TimedStage {
  readonly method: string;
  readonly name: string;
  readonly parameterIndex: number;
}

export interface HttpErrorDetail extends TimedStage {
  readonly filter: string | null;
}

export interface ExecutionDetail {
  readonly controller: ControllerDetail | undefined;
  readonly guards: readonly GuardDetail[];
  readonly httpErrors: readonly HttpErrorDetail[];
  readonly id: string;
  readonly interceptors: readonly InterceptorDetail[];
  readonly middlewares: readonly MiddlewareDetail[];
  readonly nativeMiddlewares: readonly NativeMiddlewareDetail[];
  readonly pipes: readonly PipeDetail[];
  readonly request: {
    readonly headers: readonly HeaderEntry[];
    readonly method: string;
    readonly startedAt: string;
    readonly url: string;
  };
  readonly response: {
    readonly aborted: boolean;
    readonly headers: readonly HeaderEntry[];
    readonly sentAt: string;
    readonly statusCode: number;
  };
}

export class ExecutionNotFoundError extends Error {
  constructor() {
    super('Execution was not found.');
    this.name = 'ExecutionNotFoundError';
  }
}

class ExecutionResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionResponseError';
  }
}

export function buildExecutionUrl(executionId: string): string {
  return `${EXECUTIONS_PATH}/${encodeURIComponent(executionId)}`;
}

export function readExecution(value: unknown): ExecutionDetail {
  if (!isRecord(value)) {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  const request: unknown = value['request'];
  const response: unknown = value['response'];

  if (!isRecord(request) || !isRecord(response)) {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  const startedAt: string = readTimestamp(request['startedAt']);
  const sentAt: string = readTimestamp(response['sentAt']);

  return {
    controller: readOptionalController(value['controller']),
    guards: readGuards(value['guards']),
    httpErrors: readHttpErrors(value['httpErrors']),
    id: readString(value['id']),
    interceptors: readInterceptors(value['interceptors']),
    middlewares: readMiddlewares(value['middlewares']),
    nativeMiddlewares: readNativeMiddlewares(value['nativeMiddlewares']),
    pipes: readPipes(value['pipes']),
    request: {
      headers: readHeaders(request['headers']),
      method: readString(request['method']),
      startedAt,
      url: readString(request['url']),
    },
    response: {
      aborted: readBoolean(response['aborted']),
      headers: readHeaders(response['headers']),
      sentAt,
      statusCode: readInteger(response['statusCode']),
    },
  };
}

export async function fetchExecution(
  executionId: string,
  signal: AbortSignal,
): Promise<ExecutionDetail> {
  const response: Response = await fetch(buildExecutionUrl(executionId), {
    headers: {
      accept: 'application/json',
    },
    signal,
  });

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (response.status === 404) {
    throw new ExecutionNotFoundError();
  }

  if (!response.ok) {
    throw new ExecutionResponseError(
      `Execution request failed with status ${String(response.status)}.`,
    );
  }

  return readExecution(await response.json());
}

function readMiddlewares(value: unknown): readonly MiddlewareDetail[] {
  return readArray(value, 'middlewares')
    .map((item: unknown): MiddlewareDetail => {
      const record: Record<string, unknown> = readRecord(item, 'middleware');
      const timing: TimedStage = readTiming(record);

      return {
        ...timing,
        name: readString(record['middleware']),
        phase: readString(record['phase']),
      };
    })
    .sort(compareStartedAt);
}

function readNativeMiddlewares(
  value: unknown,
): readonly NativeMiddlewareDetail[] {
  return readArray(value, 'nativeMiddlewares')
    .map((item: unknown): NativeMiddlewareDetail => {
      const record: Record<string, unknown> = readRecord(
        item,
        'native middleware',
      );
      const timing: TimedStage = readTiming(record);

      return {
        ...timing,
        name: readString(record['name']),
      };
    })
    .sort(compareStartedAt);
}

function readGuards(value: unknown): readonly GuardDetail[] {
  return readArray(value, 'guards')
    .map((item: unknown): GuardDetail => {
      const record: Record<string, unknown> = readRecord(item, 'guard');
      const timing: TimedStage = readTiming(record);

      return {
        ...timing,
        allowed: readNullableBoolean(record['allowed']),
        name: readString(record['guard']),
      };
    })
    .sort(compareStartedAt);
}

function readInterceptors(value: unknown): readonly InterceptorDetail[] {
  return readArray(value, 'interceptors')
    .map((item: unknown): InterceptorDetail => {
      const record: Record<string, unknown> = readRecord(item, 'interceptor');
      const timing: TimedStage = readTiming(record);

      return {
        ...timing,
        name: readString(record['interceptor']),
      };
    })
    .sort(compareStartedAt);
}

function readPipes(value: unknown): readonly PipeDetail[] {
  return readArray(value, 'pipes')
    .map((item: unknown): PipeDetail => {
      const record: Record<string, unknown> = readRecord(item, 'pipe');
      const timing: TimedStage = readTiming(record);

      return {
        ...timing,
        method: readString(record['method']),
        name: readString(record['pipe']),
        parameterIndex: readInteger(record['parameterIndex']),
      };
    })
    .sort(compareStartedAt);
}

function readHttpErrors(value: unknown): readonly HttpErrorDetail[] {
  return readArray(value, 'httpErrors')
    .map((item: unknown): HttpErrorDetail => {
      const record: Record<string, unknown> = readRecord(item, 'http error');
      const timing: TimedStage = readTiming(record);

      return {
        ...timing,
        filter: readNullableString(record['filter']),
      };
    })
    .sort(compareStartedAt);
}

function readOptionalController(value: unknown): ControllerDetail | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const record: Record<string, unknown> = readRecord(value, 'controller');
  const timing: TimedStage = readTiming(record);

  return {
    ...timing,
    method: readString(record['method']),
    name: readString(record['controller']),
  };
}

function readTiming(record: Record<string, unknown>): TimedStage {
  const startedAt: string = readTimestamp(record['startedAt']);
  const endedAt: string = readTimestamp(record['endedAt']);

  return {
    durationMs: durationMs(startedAt, endedAt),
    endedAt,
    error: readError(record['error']),
    id: readString(record['id']),
    startedAt,
  };
}

function readHeaders(value: unknown): readonly HeaderEntry[] {
  const record: Record<string, unknown> = readRecord(value, 'headers');
  const entries: HeaderEntry[] = [];

  for (const [name, headerValue] of Object.entries(record)) {
    entries.push({
      name,
      value: readHeaderValue(headerValue),
    });
  }

  return entries;
}

function readHeaderValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (!Array.isArray(value)) {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  const parts: string[] = [];

  for (const part of value) {
    if (typeof part !== 'string') {
      throw new ExecutionResponseError(
        'Execution response has an unexpected shape.',
      );
    }

    parts.push(part);
  }

  return parts.join(', ');
}

function readError(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value !== 'object') {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return JSON.stringify(value, null, 2);
  } catch {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }
}

function readArray(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new ExecutionResponseError(`Execution response is missing ${label}.`);
  }

  return value;
}

function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ExecutionResponseError(
      `Execution response has an unexpected ${label}.`,
    );
  }

  return value;
}

function readString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  return value;
}

function readTimestamp(value: unknown): string {
  const timestamp: string = readString(value);

  if (Number.isNaN(Date.parse(timestamp))) {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  return timestamp;
}

function readBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  return value;
}

function readNullableBoolean(value: unknown): boolean | null {
  if (value === null) {
    return null;
  }

  return readBoolean(value);
}

function readNullableString(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  return readString(value);
}

function readInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ExecutionResponseError(
      'Execution response has an unexpected shape.',
    );
  }

  return value;
}

function compareStartedAt(
  left: { readonly startedAt: string },
  right: { readonly startedAt: string },
): number {
  if (left.startedAt < right.startedAt) {
    return -1;
  }

  if (left.startedAt > right.startedAt) {
    return 1;
  }

  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
