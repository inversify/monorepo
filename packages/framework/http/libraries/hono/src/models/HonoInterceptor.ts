import { type Interceptor } from '@inversifyjs/http-core';
import { type Context, type HonoRequest } from 'hono';

export type HonoInterceptor = Interceptor<HonoRequest, Context>;
