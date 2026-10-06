import { type sendUnaryData, type ServerUnaryCall } from '@grpc/grpc-js';
import { Call, Callback, RPC, Service } from '@inversifyjs/grpc-core';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

@Service(heroServiceDefinition)
export class CallbackHeroService {
  @RPC('GetHero')
  public getHero(
    @Call() call: ServerUnaryCall<HeroRequest, HeroResponse>,
    @Callback() callback: sendUnaryData<HeroResponse>,
  ): void {
    callback(null, {
      name: call.request.id,
    });
  }
}
