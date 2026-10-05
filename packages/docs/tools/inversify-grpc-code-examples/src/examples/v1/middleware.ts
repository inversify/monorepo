import { Metadata, type MetadataValue } from '@grpc/grpc-js';
import {
  ApplyMiddleware,
  type Middleware,
  MiddlewarePhase,
  RPC,
  Service,
  UnauthenticatedGrpcError,
} from '@inversifyjs/grpc-core';
import { injectable } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

interface HeroCall {
  metadata: Metadata;
  request: HeroRequest;
}

@injectable()
export class AuthorizationMiddleware implements Middleware {
  public execute(call: HeroCall, _response: unknown, next: () => void): void {
    const authorization: MetadataValue[] = call.metadata.get('authorization');

    if (authorization.length === 0) {
      throw new UnauthenticatedGrpcError();
    }

    next();
  }
}

@injectable('Singleton')
export class AuditMiddleware implements Middleware {
  public readonly ids: string[] = [];

  public execute(call: HeroCall, _response: unknown, next: () => void): void {
    this.ids.push(call.request.id);
    next();
  }
}

@Service(heroServiceDefinition)
@ApplyMiddleware(AuthorizationMiddleware)
@ApplyMiddleware({
  middleware: AuditMiddleware,
  phase: MiddlewarePhase.PostHandler,
})
export class MiddlewareHeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
