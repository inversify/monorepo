import { type ServerWritableStream } from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  heroListServiceDefinition,
  type HeroRequest,
  type HeroResponse,
} from './loadHeroServiceDefinition.js';

@Service(heroListServiceDefinition)
export class HeroListService {
  @RPC('ListHeroes')
  public listHeroes(
    call: ServerWritableStream<HeroRequest, HeroResponse>,
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
