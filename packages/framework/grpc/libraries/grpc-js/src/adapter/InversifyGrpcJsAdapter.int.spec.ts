import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';

import {
  type ClientDuplexStream,
  type ClientReadableStream,
  type ClientWritableStream,
  credentials,
  makeClientConstructor,
  type Server,
  ServerCredentials,
  type ServiceClientConstructor,
  type ServiceError,
  status,
} from '@grpc/grpc-js';
import {
  type GrpcMethodDefinition,
  type GrpcServiceDefinition,
  NotFoundGrpcError,
  RPC,
  Service,
} from '@inversifyjs/grpc-core';
import { Container } from 'inversify';

import { InversifyGrpcJsAdapter } from './InversifyGrpcJsAdapter.js';

interface ChatMessage {
  text: string;
}

interface HeroRequest {
  id: string;
}

interface HeroResponse {
  name: string;
}

interface UploadRequest {
  name: string;
}

interface UploadResponse {
  count: number;
}

interface HeroClient {
  Chat(): ClientDuplexStream<ChatMessage, ChatMessage>;
  GetHero(
    request: HeroRequest,
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
  GetHeroWithInvalidMetadata(
    request: HeroRequest,
    options: { deadline: Date },
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
  GetMissingHero(
    request: HeroRequest,
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
  ListHeroes(request: HeroRequest): ClientReadableStream<HeroResponse>;
  ListMissingHeroes(request: HeroRequest): ClientReadableStream<HeroResponse>;
  UploadHeroes(
    callback: (error: ServiceError | null, response?: UploadResponse) => void,
  ): ClientWritableStream<UploadRequest>;
  close(): void;
}

function deserializeMessage(bytes: Buffer): unknown {
  return JSON.parse(bytes.toString()) as unknown;
}

function serializeMessage(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(value));
}

function buildMethodDefinition(
  name: string,
  requestStream: boolean,
  responseStream: boolean,
): GrpcMethodDefinition {
  return {
    path: `/test.HeroService/${name}`,
    requestDeserialize: deserializeMessage,
    requestSerialize: serializeMessage,
    requestStream,
    responseDeserialize: deserializeMessage,
    responseSerialize: serializeMessage,
    responseStream,
  };
}

function buildHeroServiceDefinition(): GrpcServiceDefinition {
  return {
    Chat: buildMethodDefinition('Chat', true, true),
    GetHero: buildMethodDefinition('GetHero', false, false),
    GetMissingHero: buildMethodDefinition('GetMissingHero', false, false),
    ListHeroes: buildMethodDefinition('ListHeroes', false, true),
    ListMissingHeroes: buildMethodDefinition('ListMissingHeroes', false, true),
    UploadHeroes: buildMethodDefinition('UploadHeroes', true, false),
  };
}

function isServiceError(error: unknown): error is ServiceError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error
  );
}

async function bindServer(server: Server): Promise<number> {
  return new Promise<number>(
    (resolve: (port: number) => void, reject: (error: Error) => void): void => {
      server.bindAsync(
        '127.0.0.1:0',
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

async function getHero(client: HeroClient, id: string): Promise<HeroResponse> {
  return new Promise<HeroResponse>(
    (
      resolve: (response: HeroResponse) => void,
      reject: (error: unknown) => void,
    ): void => {
      client.GetHero(
        { id },
        (error: ServiceError | null, response?: HeroResponse): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          if (response === undefined) {
            reject(new Error('Expected a response'));

            return;
          }

          resolve(response);
        },
      );
    },
  );
}

async function readUnaryError(client: HeroClient): Promise<ServiceError> {
  try {
    await new Promise<HeroResponse>(
      (
        resolve: (response: HeroResponse) => void,
        reject: (error: unknown) => void,
      ): void => {
        client.GetMissingHero(
          { id: 'missing' },
          (error: ServiceError | null, response?: HeroResponse): void => {
            if (error !== null) {
              reject(error);

              return;
            }

            if (response === undefined) {
              reject(new Error('Expected a response'));

              return;
            }

            resolve(response);
          },
        );
      },
    );
  } catch (error: unknown) {
    if (isServiceError(error)) {
      return error;
    }

    throw error;
  }

  throw new Error('Expected the call to fail');
}

async function readInvalidMetadataError(
  client: HeroClient,
): Promise<ServiceError> {
  return new Promise<ServiceError>(
    (
      resolve: (error: ServiceError) => void,
      reject: (error: Error) => void,
    ): void => {
      const deadline: Date = new Date(Date.now() + 1_000);

      client.GetHeroWithInvalidMetadata(
        { id: 'missing' },
        { deadline },
        (error: ServiceError | null): void => {
          if (error === null) {
            reject(new Error('Expected the call to fail'));

            return;
          }

          resolve(error);
        },
      );
    },
  );
}

async function uploadHeroes(
  client: HeroClient,
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
            reject(new Error('Expected a response'));

            return;
          }

          resolve(response);
        },
      );

      for (const name of names) {
        call.write({ name });
      }

      call.end();
    },
  );
}

async function readMessages(
  stream: ClientReadableStream<HeroResponse>,
): Promise<HeroResponse[]> {
  return new Promise<HeroResponse[]>(
    (
      resolve: (messages: HeroResponse[]) => void,
      reject: (error: unknown) => void,
    ): void => {
      const messages: HeroResponse[] = [];

      stream.on('data', (message: HeroResponse): void => {
        messages.push(message);
      });
      stream.on('error', (error: ServiceError): void => {
        reject(error);
      });
      stream.on('end', (): void => {
        resolve(messages);
      });
    },
  );
}

async function readStreamError(
  stream: ClientReadableStream<HeroResponse>,
): Promise<ServiceError> {
  return new Promise<ServiceError>(
    (
      resolve: (error: ServiceError) => void,
      reject: (error: Error) => void,
    ): void => {
      stream.on('error', (error: ServiceError): void => {
        resolve(error);
      });
      stream.on('end', (): void => {
        reject(new Error('Expected the call to fail'));
      });
    },
  );
}

async function chat(client: HeroClient, text: string): Promise<ChatMessage[]> {
  return new Promise<ChatMessage[]>(
    (
      resolve: (messages: ChatMessage[]) => void,
      reject: (error: unknown) => void,
    ): void => {
      const messages: ChatMessage[] = [];
      const stream: ClientDuplexStream<ChatMessage, ChatMessage> =
        client.Chat();

      stream.on('data', (message: ChatMessage): void => {
        messages.push(message);
      });
      stream.on('error', (error: ServiceError): void => {
        reject(error);
      });
      stream.on('end', (): void => {
        resolve(messages);
      });
      stream.write({ text });
      stream.end();
    },
  );
}

describe(InversifyGrpcJsAdapter, () => {
  describe('.build', () => {
    describe('having a hero service', () => {
      let clientFixture: HeroClient | undefined;
      let serverFixture: Server | undefined;

      beforeAll(async () => {
        const definition: GrpcServiceDefinition = buildHeroServiceDefinition();

        @Service(definition)
        class HeroService {
          @RPC('Chat')
          public chat(
            call: NodeJS.EventEmitter & {
              end: () => void;
              write: (message: ChatMessage) => void;
            },
          ): void {
            call.on('data', (message: ChatMessage): void => {
              call.write({ text: message.text });
            });
            call.on('end', (): void => {
              call.end();
            });
          }

          @RPC('GetHero')
          public getHero(call: { request: HeroRequest }): HeroResponse {
            return { name: call.request.id };
          }

          @RPC('GetMissingHero')
          public getMissingHero(): never {
            throw new NotFoundGrpcError('missing', undefined, {
              'x-hero-id': 'hero-1',
            });
          }

          @RPC('ListHeroes')
          public listHeroes(call: {
            end: () => void;
            write: (message: HeroResponse) => void;
          }): void {
            call.write({ name: 'a' });
            call.write({ name: 'b' });
            call.end();
          }

          @RPC('ListMissingHeroes')
          public listMissingHeroes(): never {
            throw new NotFoundGrpcError('missing', undefined, {
              'x-hero-id': 'hero-1',
            });
          }

          @RPC('UploadHeroes')
          public async uploadHeroes(
            call: NodeJS.EventEmitter,
          ): Promise<UploadResponse> {
            return new Promise<UploadResponse>(
              (
                resolve: (response: UploadResponse) => void,
                reject: (error: Error) => void,
              ): void => {
                let count: number = 0;

                call.on('data', (): void => {
                  count += 1;
                });
                call.on('end', (): void => {
                  resolve({ count });
                });
                call.on('error', (error: Error): void => {
                  reject(error);
                });
              },
            );
          }
        }

        const container: Container = new Container();

        container.bind(HeroService).toSelf();

        const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
          container,
          { logger: false },
        );
        const server: Server = await adapter.build();
        const port: number = await bindServer(server);
        const heroClientConstructor: ServiceClientConstructor =
          makeClientConstructor(definition, 'HeroService');

        serverFixture = server;
        clientFixture = new heroClientConstructor(
          `127.0.0.1:${String(port)}`,
          credentials.createInsecure(),
        ) as unknown as HeroClient;
      });

      afterAll(() => {
        clientFixture?.close();

        if (serverFixture !== undefined) {
          serverFixture.forceShutdown();
        }
      });

      describe('when a unary RPC returns a message', () => {
        let responseFixture: HeroResponse;

        beforeAll(async () => {
          if (clientFixture === undefined) {
            throw new Error('Expected the client to be started');
          }

          responseFixture = await getHero(clientFixture, 'hero-1');
        });

        it('should send that message to the client', () => {
          expect(responseFixture).toStrictEqual({ name: 'hero-1' });
        });
      });

      describe('when a unary RPC throws NotFoundGrpcError', () => {
        let errorFixture: ServiceError;

        beforeAll(async () => {
          if (clientFixture === undefined) {
            throw new Error('Expected the client to be started');
          }

          errorFixture = await readUnaryError(clientFixture);
        });

        it('should fail with NOT_FOUND', () => {
          expect(errorFixture.code).toBe(status.NOT_FOUND);
        });

        it('should send the error details', () => {
          expect(errorFixture.details).toBe('missing');
        });

        it('should send the metadata', () => {
          expect(errorFixture.metadata.get('x-hero-id')).toStrictEqual([
            'hero-1',
          ]);
        });
      });

      describe('when a client-streaming RPC returns a count', () => {
        let responseFixture: UploadResponse;

        beforeAll(async () => {
          if (clientFixture === undefined) {
            throw new Error('Expected the client to be started');
          }

          responseFixture = await uploadHeroes(clientFixture, ['a', 'b']);
        });

        it('should send that count to the client', () => {
          expect(responseFixture).toStrictEqual({ count: 2 });
        });
      });

      describe('when a server-streaming RPC writes messages', () => {
        let messagesFixture: HeroResponse[];

        beforeAll(async () => {
          if (clientFixture === undefined) {
            throw new Error('Expected the client to be started');
          }

          messagesFixture = await readMessages(
            clientFixture.ListHeroes({ id: 'hero-1' }),
          );
        });

        it('should deliver those messages', () => {
          expect(messagesFixture).toStrictEqual([{ name: 'a' }, { name: 'b' }]);
        });
      });

      describe('when a server-streaming RPC throws NotFoundGrpcError', () => {
        let errorFixture: ServiceError;

        beforeAll(async () => {
          if (clientFixture === undefined) {
            throw new Error('Expected the client to be started');
          }

          errorFixture = await readStreamError(
            clientFixture.ListMissingHeroes({ id: 'missing' }),
          );
        });

        it('should fail with NOT_FOUND', () => {
          expect(errorFixture.code).toBe(status.NOT_FOUND);
        });

        it('should send the error details', () => {
          expect(errorFixture.details).toBe('missing');
        });

        it('should send the metadata', () => {
          expect(errorFixture.metadata.get('x-hero-id')).toStrictEqual([
            'hero-1',
          ]);
        });
      });

      describe('when a bidirectional RPC echoes a message', () => {
        let messagesFixture: ChatMessage[];

        beforeAll(async () => {
          if (clientFixture === undefined) {
            throw new Error('Expected the client to be started');
          }

          messagesFixture = await chat(clientFixture, 'hi');
        });

        it('should deliver the echoed message', () => {
          expect(messagesFixture).toStrictEqual([{ text: 'hi' }]);
        });
      });
    });

    describe('having a unary RPC that throws NotFoundGrpcError with metadata grpc-js rejects', () => {
      let clientFixture: HeroClient | undefined;
      let errorFixture: ServiceError;
      let serverFixture: Server | undefined;

      beforeAll(async () => {
        const definition: GrpcServiceDefinition = {
          GetHeroWithInvalidMetadata: buildMethodDefinition(
            'GetHeroWithInvalidMetadata',
            false,
            false,
          ),
        };

        @Service(definition)
        class HeroService {
          @RPC('GetHeroWithInvalidMetadata')
          public getHeroWithInvalidMetadata(): never {
            throw new NotFoundGrpcError('missing', undefined, {
              raw: Buffer.from('hero'),
              'x-hero-id': 'hero-1',
            });
          }
        }

        const container: Container = new Container();

        container.bind(HeroService).toSelf();

        const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
          container,
          { logger: false },
        );
        const server: Server = await adapter.build();
        const port: number = await bindServer(server);
        const heroClientConstructor: ServiceClientConstructor =
          makeClientConstructor(definition, 'HeroService');

        serverFixture = server;
        clientFixture = new heroClientConstructor(
          `127.0.0.1:${String(port)}`,
          credentials.createInsecure(),
        ) as unknown as HeroClient;

        errorFixture = await readInvalidMetadataError(clientFixture);
      });

      afterAll(() => {
        clientFixture?.close();

        if (serverFixture !== undefined) {
          serverFixture.forceShutdown();
        }
      });

      it('should keep the NOT_FOUND status', () => {
        expect(errorFixture.code).toBe(status.NOT_FOUND);
      });

      it('should send the error details', () => {
        expect(errorFixture.details).toBe('missing');
      });

      it('should send the metadata grpc-js accepted', () => {
        expect(errorFixture.metadata.get('x-hero-id')).toStrictEqual([
          'hero-1',
        ]);
      });

      it('should omit the metadata grpc-js rejected', () => {
        expect(errorFixture.metadata.get('raw')).toStrictEqual([]);
      });
    });
  });
});
