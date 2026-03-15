import { type ErrorFilter } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

export type UwebSocketsErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  HttpRequest,
  HttpResponse,
  void
>;
