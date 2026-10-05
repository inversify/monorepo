import {
  createCustomParameterDecorator,
  type Pipe,
  RPC,
  Service,
} from '@inversifyjs/grpc-core';
import { injectable } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

@injectable()
export class UppercasePipe implements Pipe<string, string> {
  public execute(input: string): string {
    return input.toUpperCase();
  }
}

@injectable()
export class PrefixPipe implements Pipe<string, string> {
  public execute(input: string): string {
    return `hero:${input}`;
  }
}

export const heroId: ParameterDecorator = createCustomParameterDecorator(
  (call: { request: HeroRequest }): string => call.request.id,
  PrefixPipe,
);

@Service(heroServiceDefinition)
export class PipedHeroService {
  @RPC('GetHero')
  public getHero(@heroId id: string): HeroResponse {
    return {
      name: id,
    };
  }
}
