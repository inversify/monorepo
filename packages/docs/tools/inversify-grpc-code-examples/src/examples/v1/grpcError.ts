import { NotFoundGrpcError, RPC, Service } from '@inversifyjs/grpc-core';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

@Service(heroServiceDefinition)
export class NotFoundHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    if (call.request.id === 'missing') {
      throw new NotFoundGrpcError(`Hero ${call.request.id} was not found`);
    }

    return {
      name: call.request.id,
    };
  }
}
