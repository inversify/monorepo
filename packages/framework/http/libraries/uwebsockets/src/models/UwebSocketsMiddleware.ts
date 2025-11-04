import { Middleware } from '@inversifyjs/http-core';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export type UwebSocketsMiddleware = Middleware<
  HttpRequest,
  HttpResponse,
  () => void,
  void
>;
