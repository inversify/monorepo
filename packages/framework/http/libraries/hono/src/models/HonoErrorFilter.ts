import { ErrorFilter } from '@inversifyjs/http-core';
import { Context, HonoRequest } from 'hono';

export type HonoErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  HonoRequest,
  Context,
  Response | undefined
>;
