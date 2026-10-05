import { ServiceError } from '@grpc/grpc-js';

import { HeroClient } from '../models/HeroClient.js';
import { HeroRequest } from '../models/HeroRequest.js';
import { HeroResponse } from '../models/HeroResponse.js';

function isHeroResponse(value: unknown): value is HeroResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'name' in value && typeof value.name === 'string';
}

export async function getHero(
  client: HeroClient,
  id: string,
): Promise<HeroResponse> {
  const response: unknown = await new Promise<unknown>(
    (
      resolve: (value: unknown) => void,
      reject: (error: unknown) => void,
    ): void => {
      const request: HeroRequest = {
        id,
      };

      client.GetHero(
        request,
        (error: ServiceError | null, heroResponse?: HeroResponse): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          resolve(heroResponse);
        },
      );
    },
  );

  if (!isHeroResponse(response)) {
    throw new Error('Expected a hero response');
  }

  return response;
}
