import { type RequestTransformer as CoreRequestTransformer } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

export type RequestTransformer = CoreRequestTransformer<
  HttpRequest,
  HttpResponse
>;
