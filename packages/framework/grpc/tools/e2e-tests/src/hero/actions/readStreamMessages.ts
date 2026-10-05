import { type ClientReadableStream, type ServiceError } from '@grpc/grpc-js';

export async function readStreamMessages(
  stream: ClientReadableStream<unknown>,
): Promise<unknown[]> {
  return new Promise<unknown[]>(
    (
      resolve: (messages: unknown[]) => void,
      reject: (error: unknown) => void,
    ): void => {
      const messages: unknown[] = [];

      stream.on('data', (message: unknown): void => {
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
