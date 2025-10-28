import { Interceptor } from '@inversifyjs/http-core';
import { Context, HonoRequest } from 'hono';

export type HonoInterceptor = Interceptor<HonoRequest, Context>;
