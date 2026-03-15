import { type Middleware } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

export type UwebSocketsMiddleware = Middleware<
  HttpRequest,
  HttpResponse,
  () => void,
  void
>;
