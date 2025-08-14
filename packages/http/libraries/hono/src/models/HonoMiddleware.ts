import { Middleware } from '@inversifyjs/http-core';
import { Context, HonoRequest, Next } from 'hono';

export type HonoMiddleware = Middleware<
  HonoRequest,
  Context,
  Next,
  Response | undefined
>;
