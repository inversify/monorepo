import { type Server } from '@grpc/grpc-js';
import { InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { ConsoleLogger } from '@inversifyjs/logger';
import { type Container } from 'inversify';

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
