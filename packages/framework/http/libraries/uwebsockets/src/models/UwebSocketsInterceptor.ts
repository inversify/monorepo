import { type Interceptor } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

export type UwebSocketsInterceptor = Interceptor<HttpRequest, HttpResponse>;
