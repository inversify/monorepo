import { Interceptor } from '@inversifyjs/http-core';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export type UwebSocketsInterceptor = Interceptor<HttpRequest, HttpResponse>;
