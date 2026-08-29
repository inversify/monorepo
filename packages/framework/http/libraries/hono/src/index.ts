import { type ResponseParam } from '@inversifyjs/http-core';

import { InversifyHonoHttpAdapter } from './adapter/InversifyHonoHttpAdapter.js';
import { CorsMiddleware } from './middlewares/CorsMiddleware.js';
import { createRouteValueMetadataUtils } from './valueMetadata/calculations/createRouteValueMetadataUtils.js';

export type HonoContext<T> = ResponseParam<T>;

export type { HonoErrorFilter } from './models/HonoErrorFilter.js';
export type { HonoGuard } from './models/HonoGuard.js';
export type { HonoInterceptor } from './models/HonoInterceptor.js';
export type { HonoMiddleware } from './models/HonoMiddleware.js';

export {
  CorsMiddleware,
  createRouteValueMetadataUtils,
  InversifyHonoHttpAdapter,
};
