import { durationMs } from './durationMs.js';

const EXECUTIONS_PAGE_SIZE: number = 20;
const EXECUTIONS_PATH: string = '/.inversify/v1/executions';
const EXECUTIONS_SORT: string = 'startedAtDesc';

export interface ExecutionSummary {
  readonly durationMs: number;
  readonly id: string;
  readonly method: string;
  readonly url: string;
}

export interface ExecutionsPage {
  readonly items: readonly ExecutionSummary[];
  readonly page: number;
  readonly total: number;
}

export interface ExecutionsQuery {
  readonly page: number;
  readonly requestUrlLike: string;
}

class ExecutionsResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionsResponseError';
  }
}

export function buildExecutionsUrl(query: ExecutionsQuery): string {
  const params: URLSearchParams = new URLSearchParams();

  params.set('page', String(query.page));
  params.set('pageSize', String(EXECUTIONS_PAGE_SIZE));

  if (query.requestUrlLike.length > 0) {
    params.set('requestUrlLike', query.requestUrlLike);
  }

  params.set('sort', EXECUTIONS_SORT);

  return `${EXECUTIONS_PATH}?${params.toString()}`;
}

export function nextExecutionsPage(page: ExecutionsPage): number | undefined {
  const loadedThrough: number = page.page * EXECUTIONS_PAGE_SIZE;

  if (page.items.length === 0 || loadedThrough >= page.total) {
    return undefined;
  }

  return page.page + 1;
}

export function readExecutionsPage(
  value: unknown,
  page: number,
): ExecutionsPage {
  if (!isRecord(value) || !Array.isArray(value['items'])) {
    throw new ExecutionsResponseError(
      'Executions response has an unexpected shape.',
    );
  }

  const total: unknown = value['total'];

  if (typeof total !== 'number' || !Number.isFinite(total)) {
    throw new ExecutionsResponseError(
      'Executions response has an unexpected shape.',
    );
  }

  return {
    items: value['items'].map(readExecutionSummary),
    page,
    total,
  };
}

export async function fetchExecutionsPage(
  query: ExecutionsQuery,
  signal: AbortSignal,
): Promise<ExecutionsPage> {
  const response: Response = await fetch(buildExecutionsUrl(query), {
    headers: {
      accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new ExecutionsResponseError(
      `Executions request failed with status ${String(response.status)}.`,
    );
  }

  return readExecutionsPage(await response.json(), query.page);
}

function readExecutionSummary(value: unknown): ExecutionSummary {
  if (!isRecord(value)) {
    throw new ExecutionsResponseError(
      'Execution item has an unexpected shape.',
    );
  }

  const id: unknown = value['id'];
  const request: unknown = value['request'];
  const response: unknown = value['response'];

  if (typeof id !== 'string' || !isRecord(request) || !isRecord(response)) {
    throw new ExecutionsResponseError(
      'Execution item has an unexpected shape.',
    );
  }

  const method: unknown = request['method'];
  const startedAt: unknown = request['startedAt'];
  const url: unknown = request['url'];
  const sentAt: unknown = response['sentAt'];

  if (
    typeof method !== 'string' ||
    typeof startedAt !== 'string' ||
    typeof url !== 'string' ||
    typeof sentAt !== 'string'
  ) {
    throw new ExecutionsResponseError(
      'Execution item has an unexpected shape.',
    );
  }

  return {
    durationMs: durationMs(startedAt, sentAt),
    id,
    method,
    url,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
