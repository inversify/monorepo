import { type ClientWritableStream, type ServiceError } from '@grpc/grpc-js';

import { type UploadRequest } from '../generated/hero.js';
import { type HeroClient } from '../models/HeroClient.js';
import {
  isUploadResponse,
  type UploadResponse,
} from '../models/UploadResponse.js';

export async function uploadHeroes(
  client: HeroClient,
  names: readonly string[],
): Promise<UploadResponse> {
  const response: unknown = await new Promise<unknown>(
    (
      resolve: (value: unknown) => void,
      reject: (error: unknown) => void,
    ): void => {
      const call: ClientWritableStream<UploadRequest> = client.uploadHeroes(
        (error: ServiceError | null, uploadResponse?: UploadResponse): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          resolve(uploadResponse);
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

  if (!isUploadResponse(response)) {
    throw new Error('Expected an upload response');
  }

  return response;
}
