import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

class ParentHeroService {
  @RPC('GetHero')
  public getHero(_call: { request: HeroRequest }): HeroResponse {
    return {
      name: 'parent',
    };
  }
}

@Service(heroServiceDefinition)
export class InheritedHeroService extends ParentHeroService {}

@Service(heroServiceDefinition)
export class OverridingHeroService extends ParentHeroService {
  @RPC('GetHero')
  public override getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
