import { Server, ServerCredentials } from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';
import { InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { Container } from 'inversify';

import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

@Service(heroServiceDefinition)
export class HeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}

export interface StartedGrpcServer {
  port: number;
  server: Server;
}

export async function startGrpcServer(
  address: string,
): Promise<StartedGrpcServer> {
  const container: Container = new Container();

  container.bind(HeroService).toSelf();

  const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
    container,
    {
      logger: false,
    },
  );
  const server: Server = await adapter.build();
  const port: number = await new Promise<number>(
    (
      resolve: (boundPort: number) => void,
      reject: (error: Error) => void,
    ): void => {
      server.bindAsync(
        address,
        ServerCredentials.createInsecure(),
        (error: Error | null, boundPort: number): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          resolve(boundPort);
        },
      );
    },
  );

  return {
    port,
    server,
  };
}

export async function main(): Promise<void> {
  const started: StartedGrpcServer = await startGrpcServer('0.0.0.0:50051');

  console.log(`gRPC server is listening on port ${started.port.toString()}`);
}
