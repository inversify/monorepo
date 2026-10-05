import { type ServiceError } from '@grpc/grpc-js';

import { type HeroRequest } from '../generated/hero.js';
import { type HeroClient } from '../models/HeroClient.js';
import { type HeroResponse, isHeroResponse } from '../models/HeroResponse.js';

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

      client.getHero(
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
