import { type ErrorFilter } from '@inversifyjs/http-core';
import { type Context, type HonoRequest } from 'hono';

export type HonoErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  HonoRequest,
  Context,
  Response | undefined
>;
