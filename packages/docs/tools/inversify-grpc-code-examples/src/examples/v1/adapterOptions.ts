import { type Server } from '@grpc/grpc-js';
// Exclude-from-example
import { RPC, Service } from '@inversifyjs/grpc-core';
import { InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { ConsoleLogger } from '@inversifyjs/logger';
import { type Container } from 'inversify';

// Exclude-from-example
import {
  type HeroRequest,
  type HeroResponse,
  HeroServiceService,
} from './generated/hero.js';

// Exclude-from-example
@Service(HeroServiceService)
export class HeroService {
  @RPC('getHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}

const maxReceiveMessageLength: number = 1_048_576;

export function createAdapter(container: Container): InversifyGrpcJsAdapter {
  return new InversifyGrpcJsAdapter(container, {
    logger: new ConsoleLogger('hero'),
    serverOptions: {
      'grpc.max_receive_message_length': maxReceiveMessageLength,
    },
  });
}

export function createCustomServerAdapter(
  container: Container,
  server: Server,
): InversifyGrpcJsAdapter {
  return new InversifyGrpcJsAdapter(
    container,
    {
      logger: false,
    },
    server,
  );
}
