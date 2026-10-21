import { durationMs } from './durationMs.js';

const CALLS_PAGE_SIZE: number = 20;
const CALLS_PATH: string = '/.inversify/v1/calls';
const CALLS_SORT: string = 'startedAtDesc';

export interface CallSummary {
  readonly durationMs: number;
  readonly id: string;
  readonly method: string;
  readonly statusCode: number;
  readonly url: string;
}

export interface CallsPage {
  readonly items: readonly CallSummary[];
  readonly page: number;
  readonly total: number;
}

export interface CallFilters {
  readonly requestMethod: string | undefined;
  readonly responseStatusCode: number | undefined;
}

export interface CallsSearch extends CallFilters {
  readonly requestUrlLike: string;
}

export interface CallsQuery extends CallsSearch {
  readonly page: number;
}

class CallsResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CallsResponseError';
  }
}

export function buildCallsUrl(query: CallsQuery): string {
  const params: URLSearchParams = new URLSearchParams();

  params.set('page', String(query.page));
  params.set('pageSize', String(CALLS_PAGE_SIZE));

  if (query.requestMethod !== undefined && query.requestMethod.length > 0) {
    params.set('requestMethod', query.requestMethod);
  }

  if (query.requestUrlLike.length > 0) {
    params.set('requestUrlLike', query.requestUrlLike);
  }

  if (query.responseStatusCode !== undefined) {
    params.set('responseStatusCode', String(query.responseStatusCode));
  }

  params.set('sort', CALLS_SORT);

  return `${CALLS_PATH}?${params.toString()}`;
}

export function nextCallsPage(page: CallsPage): number | undefined {
  const loadedThrough: number = page.page * CALLS_PAGE_SIZE;

  if (page.items.length === 0 || loadedThrough >= page.total) {
    return undefined;
  }

  return page.page + 1;
}

export function readCallsPage(value: unknown, page: number): CallsPage {
  if (!isRecord(value) || !Array.isArray(value['items'])) {
    throw new CallsResponseError('Calls response has an unexpected shape.');
  }

  const total: unknown = value['total'];

  if (typeof total !== 'number' || !Number.isFinite(total)) {
    throw new CallsResponseError('Calls response has an unexpected shape.');
  }

  return {
    items: value['items'].map(readCallSummary),
    page,
    total,
  };
}

export async function fetchCallsPage(
  query: CallsQuery,
  signal: AbortSignal,
): Promise<CallsPage> {
  const response: Response = await fetch(buildCallsUrl(query), {
    headers: {
      accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new CallsResponseError(
      `Calls request failed with status ${String(response.status)}.`,
    );
  }

  return readCallsPage(await response.json(), query.page);
}

function readCallSummary(value: unknown): CallSummary {
  if (!isRecord(value)) {
    throw new CallsResponseError('Call item has an unexpected shape.');
  }

  const id: unknown = value['id'];
  const request: unknown = value['request'];
  const response: unknown = value['response'];

  if (typeof id !== 'string' || !isRecord(request) || !isRecord(response)) {
    throw new CallsResponseError('Call item has an unexpected shape.');
  }

  const method: unknown = request['method'];
  const startedAt: unknown = request['startedAt'];
  const url: unknown = request['url'];
  const sentAt: unknown = response['sentAt'];
  const statusCode: unknown = response['statusCode'];

  if (
    typeof method !== 'string' ||
    typeof startedAt !== 'string' ||
    typeof url !== 'string' ||
    typeof sentAt !== 'string' ||
    typeof statusCode !== 'number' ||
    !Number.isInteger(statusCode)
  ) {
    throw new CallsResponseError('Call item has an unexpected shape.');
  }

  return {
    durationMs: durationMs(startedAt, sentAt),
    id,
    method,
    statusCode,
    url,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
