import { Server } from '@grpc/grpc-js';
import {
  grpcServerServiceIdentifier,
  RPC,
  Service,
} from '@inversifyjs/grpc-core';
import { inject } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

@Service(heroServiceDefinition)
export class ServerAwareHeroService {
  readonly #server: Server;

  constructor(@inject(grpcServerServiceIdentifier) server: Server) {
    this.#server = server;
  }

  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: this.#server instanceof Server ? call.request.id : 'missing',
    };
  }
}
