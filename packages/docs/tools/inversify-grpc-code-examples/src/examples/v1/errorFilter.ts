import {
  CatchError,
  type ErrorFilter,
  NotFoundGrpcError,
  RPC,
  Service,
  UseErrorFilter,
} from '@inversifyjs/grpc-core';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

export class HeroNotFoundError extends Error {
  public readonly id: string;

  constructor(id: string) {
    super(`Hero ${id} was not found`);

    this.id = id;
  }
}

@CatchError(HeroNotFoundError)
export class HeroNotFoundErrorFilter implements ErrorFilter {
  public catch(error: HeroNotFoundError): never {
    throw new NotFoundGrpcError(error.message);
  }
}

@Service(heroServiceDefinition)
@UseErrorFilter(HeroNotFoundErrorFilter)
export class FilteredHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    if (call.request.id === 'missing') {
      throw new HeroNotFoundError(call.request.id);
    }

    return {
      name: call.request.id,
    };
  }
}

@Service(heroServiceDefinition)
export class UnfilteredHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    if (call.request.id === 'missing') {
      throw new HeroNotFoundError(call.request.id);
    }

    return {
      name: call.request.id,
    };
  }
}
