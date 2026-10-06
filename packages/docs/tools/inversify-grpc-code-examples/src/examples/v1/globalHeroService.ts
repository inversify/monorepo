import { RPC, Service } from '@inversifyjs/grpc-core';

import { HeroNotFoundError } from './errorFilter.js';
import {
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';
import { heroId } from './pipe.js';

@Service(heroServiceDefinition)
export class GlobalHeroService {
  @RPC('GetHero')
  public getHero(@heroId id: string): HeroResponse {
    if (id.includes('MISSING')) {
      throw new HeroNotFoundError(id);
    }

    return {
      name: id,
    };
  }
}
