import { type ServerWritableStream } from '@grpc/grpc-js';
import { Call, RPC, Service } from '@inversifyjs/grpc-core';

import {
  heroListServiceDefinition,
  type HeroRequest,
  type HeroResponse,
} from './loadHeroServiceDefinition.js';

@Service(heroListServiceDefinition)
export class CallHeroListService {
  @RPC('ListHeroes')
  public listHeroes(
    @Call() call: ServerWritableStream<HeroRequest, HeroResponse>,
  ): void {
    const id: string = call.request.id;

    call.write({
      name: `${id}-a`,
    });
    call.write({
      name: `${id}-b`,
    });
    call.end();
  }
}
