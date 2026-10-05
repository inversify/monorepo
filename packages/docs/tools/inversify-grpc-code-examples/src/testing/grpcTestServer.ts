import {
  Client,
  type ClientDuplexStream,
  type ClientReadableStream,
  type ClientWritableStream,
  credentials,
  type Metadata,
  type Server,
  ServerCredentials,
  type ServiceClientConstructor,
  type ServiceError,
} from '@grpc/grpc-js';
import { InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { Container } from 'inversify';

import {
  type ChatMessage,
  getHeroServiceConstructor,
  type HeroRequest,
  type HeroResponse,
  type UploadRequest,
  type UploadResponse,
} from '../examples/v1/loadHeroServiceDefinition.js';

export interface HeroChatClient extends Client {
  Chat(): ClientDuplexStream<ChatMessage, ChatMessage>;
}

export interface HeroClient extends Client {
  GetHero(
    request: HeroRequest,
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
  GetHero(
    request: HeroRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
}

export interface HeroListClient extends Client {
  ListHeroes(request: HeroRequest): ClientReadableStream<HeroResponse>;
}

export interface HeroUploadClient extends Client {
  UploadHeroes(
    callback: (error: ServiceError | null, response?: UploadResponse) => void,
  ): ClientWritableStream<UploadRequest>;
}

export async function bindServer(
  server: Server,
  address: string,
): Promise<number> {
  return new Promise<number>(
    (resolve: (port: number) => void, reject: (error: Error) => void): void => {
      server.bindAsync(
        address,
        ServerCredentials.createInsecure(),
        (error: Error | null, port: number): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          resolve(port);
        },
      );
    },
  );
}

export function connectHeroChatClient(address: string): HeroChatClient {
  return connect(address, 'HeroChatService') as HeroChatClient;
}

export function connectHeroClient(address: string): HeroClient {
  return connect(address, 'HeroService') as HeroClient;
}

export function connectHeroListClient(address: string): HeroListClient {
  return connect(address, 'HeroListService') as HeroListClient;
}

export function connectHeroUploadClient(address: string): HeroUploadClient {
  return connect(address, 'HeroUploadService') as HeroUploadClient;
}

export async function getHero(
  client: HeroClient,
  id: string,
  metadata?: Metadata,
): Promise<HeroResponse> {
  return new Promise<HeroResponse>(
    (
      resolve: (response: HeroResponse) => void,
      reject: (error: unknown) => void,
    ): void => {
      const callback: (
        error: ServiceError | null,
        response?: HeroResponse,
      ) => void = (
        error: ServiceError | null,
        response?: HeroResponse,
      ): void => {
        if (error !== null) {
          reject(error);

          return;
        }

        if (response === undefined) {
          reject(new Error('Expected a hero response'));

          return;
        }

        resolve(response);
      };

      if (metadata === undefined) {
        client.GetHero({ id }, callback);

        return;
      }

      client.GetHero({ id }, metadata, callback);
    },
  );
}

export async function captureServiceError(
  action: () => Promise<unknown>,
): Promise<ServiceError> {
  try {
    await action();
  } catch (error: unknown) {
    return readServiceError(error);
  }

  throw new Error('Expected the RPC to fail');
}

export function isServiceError(error: unknown): error is ServiceError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number' &&
    'details' in error &&
    typeof error.details === 'string'
  );
}

export async function readChat(
  client: HeroChatClient,
  texts: string[],
): Promise<ChatMessage[]> {
  const call: ClientDuplexStream<ChatMessage, ChatMessage> = client.Chat();
  const messages: Promise<ChatMessage[]> = readStream<ChatMessage>(call);

  for (const text of texts) {
    call.write({
      text,
    });
  }

  call.end();

  return messages;
}

export async function readHeroes(
  client: HeroListClient,
  id: string,
): Promise<HeroResponse[]> {
  return readStream<HeroResponse>(client.ListHeroes({ id }));
}

export function readServiceError(error: unknown): ServiceError {
  if (isServiceError(error)) {
    return error;
  }

  throw error;
}

export async function shutdownServer(server: Server): Promise<void> {
  await new Promise<void>(
    (resolve: () => void, reject: (error: Error) => void): void => {
      server.tryShutdown((error?: Error): void => {
        if (error !== undefined) {
          reject(error);

          return;
        }

        resolve();
      });
    },
  );
}

export async function uploadHeroes(
  client: HeroUploadClient,
  names: string[],
): Promise<UploadResponse> {
  return new Promise<UploadResponse>(
    (
      resolve: (response: UploadResponse) => void,
      reject: (error: unknown) => void,
    ): void => {
      const call: ClientWritableStream<UploadRequest> = client.UploadHeroes(
        (error: ServiceError | null, response?: UploadResponse): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          if (response === undefined) {
            reject(new Error('Expected an upload response'));

            return;
          }

          resolve(response);
        },
      );

      for (const name of names) {
        call.write({
          name,
        });
      }

      call.end();
    },
  );
}

export async function usingClient<TClient extends Client>(
  client: TClient,
  run: (client: TClient) => Promise<void>,
): Promise<void> {
  try {
    await run(client);
  } finally {
    closeClient(client);
  }
}

function closeClient(client: object): void {
  if (client instanceof Client) {
    client.close();
  }
}

export async function withServer(
  configure: (container: Container, adapter: InversifyGrpcJsAdapter) => void,
  run: (address: string, container: Container) => Promise<void>,
): Promise<void> {
  const container: Container = new Container();
  const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
    container,
    {
      logger: false,
    },
  );

  configure(container, adapter);

  const server: Server = await adapter.build();

  try {
    const port: number = await bindServer(server, '127.0.0.1:0');

    await run(`127.0.0.1:${port.toString()}`, container);
  } finally {
    await shutdownServer(server);
  }
}

function connect(address: string, serviceName: string): Client {
  const serviceConstructor: ServiceClientConstructor =
    getHeroServiceConstructor(serviceName);

  return new serviceConstructor(address, credentials.createInsecure());
}

async function readStream<TMessage>(
  stream: ClientReadableStream<TMessage>,
): Promise<TMessage[]> {
  return new Promise<TMessage[]>(
    (
      resolve: (messages: TMessage[]) => void,
      reject: (error: unknown) => void,
    ): void => {
      const messages: TMessage[] = [];

      stream.on('data', (message: TMessage): void => {
        messages.push(message);
      });
      stream.on('error', (error: Error): void => {
        reject(error);
      });
      stream.on('end', (): void => {
        resolve(messages);
      });
    },
  );
}
