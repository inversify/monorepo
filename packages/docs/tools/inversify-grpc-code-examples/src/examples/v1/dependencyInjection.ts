import { RPC, Service } from '@inversifyjs/grpc-core';
import { inject, injectable } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

@injectable()
export class HeroRepository {
  public findName(id: string): string {
    return id;
  }
}

@Service(heroServiceDefinition)
export class RepositoryHeroService {
  readonly #heroRepository: HeroRepository;

  constructor(@inject(HeroRepository) heroRepository: HeroRepository) {
    this.#heroRepository = heroRepository;
  }

  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: this.#heroRepository.findName(call.request.id),
    };
  }
}
