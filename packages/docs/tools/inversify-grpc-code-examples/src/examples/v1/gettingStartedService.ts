import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  type HeroRequest,
  type HeroResponse,
  HeroServiceService,
} from './generated/hero.js';

@Service(HeroServiceService)
export class HeroService {
  @RPC('getHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
