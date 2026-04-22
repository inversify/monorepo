import { type OpenApiRouter } from '../../router/services/OpenApiRouter.js';
import { type OpenApiResolver } from '../services/OpenApiResolver.js';

export interface OpenApiValidationContext {
  resolver: OpenApiResolver;
  router: OpenApiRouter;
}
