import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

export const heroServiceIdentifier: symbol = Symbol.for(
  '@example/hero-service',
);

@Service(heroServiceDefinition, {
  scope: 'Singleton',
  serviceIdentifier: heroServiceIdentifier,
})
export class SingletonHeroService {
  public static instanceCount: number = 0;

  constructor() {
    SingletonHeroService.instanceCount += 1;
  }

  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
