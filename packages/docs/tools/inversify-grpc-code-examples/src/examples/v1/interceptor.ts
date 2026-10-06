import {
  type Interceptor,
  type InterceptorTransformObject,
  RPC,
  Service,
  UseInterceptor,
} from '@inversifyjs/grpc-core';
import { injectable } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

function isHeroResponse(value: unknown): value is HeroResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

@injectable()
export class SuffixInterceptor implements Interceptor {
  public async intercept(
    _call: unknown,
    _response: unknown,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    const transform: InterceptorTransformObject = await next();

    transform.push((value: unknown): unknown => {
      if (!isHeroResponse(value)) {
        return value;
      }

      return {
        name: `${value.name}!`,
      };
    });
  }
}

@Service(heroServiceDefinition)
@UseInterceptor(SuffixInterceptor)
export class InterceptedHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
