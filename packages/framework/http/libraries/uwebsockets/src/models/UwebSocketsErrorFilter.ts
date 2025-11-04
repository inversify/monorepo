import { ErrorFilter } from '@inversifyjs/http-core';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export type UwebSocketsErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  HttpRequest,
  HttpResponse,
  void
>;
