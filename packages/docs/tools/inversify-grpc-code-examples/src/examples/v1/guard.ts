import {
  type Guard,
  RPC,
  Service,
  UnauthenticatedGrpcError,
  UseGuard,
} from '@inversifyjs/grpc-core';
import { injectable } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

interface HeroCall {
  metadata: {
    get(key: string): Array<string | Uint8Array>;
  };
  request: HeroRequest;
}

function isHeroCall(call: object): call is HeroCall {
  if (!('metadata' in call) || !('request' in call)) {
    return false;
  }

  const request: unknown = call.request;

  return (
    typeof request === 'object' &&
    request !== null &&
    'id' in request &&
    typeof request.id === 'string'
  );
}

@injectable()
export class HeroIdGuard implements Guard {
  public activate(call: object): boolean {
    if (!isHeroCall(call)) {
      return false;
    }

    return call.request.id !== 'forbidden';
  }
}

@injectable()
export class AuthenticationGuard implements Guard<HeroCall> {
  public activate(call: HeroCall): boolean {
    if (call.metadata.get('authorization').length === 0) {
      throw new UnauthenticatedGrpcError();
    }

    return true;
  }
}

@Service(heroServiceDefinition)
@UseGuard(HeroIdGuard)
export class GuardedHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}

@Service(heroServiceDefinition)
@UseGuard(AuthenticationGuard)
export class AuthenticatedHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
