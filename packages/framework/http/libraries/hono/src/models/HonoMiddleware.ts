import { type Middleware } from '@inversifyjs/http-core';
import { type Context, type HonoRequest, type Next } from 'hono';

export type HonoMiddleware = Middleware<
  HonoRequest,
  Context,
  Next,
  Response | undefined
>;
