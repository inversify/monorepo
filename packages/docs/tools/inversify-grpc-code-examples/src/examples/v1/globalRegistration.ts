import { type InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';

import { HeroNotFoundErrorFilter } from './errorFilter.js';
import { HeroIdGuard } from './guard.js';
import { SuffixInterceptor } from './interceptor.js';
import { AuthorizationMiddleware } from './middleware.js';
import { UppercasePipe } from './pipe.js';

export function registerGlobalHandlers(adapter: InversifyGrpcJsAdapter): void {
  adapter.applyGlobalMiddleware(AuthorizationMiddleware);
  adapter.applyGlobalGuards(HeroIdGuard);
  adapter.useGlobalInterceptors(SuffixInterceptor);
  adapter.useGlobalPipe(UppercasePipe);
  adapter.useGlobalFilters(HeroNotFoundErrorFilter);
}
