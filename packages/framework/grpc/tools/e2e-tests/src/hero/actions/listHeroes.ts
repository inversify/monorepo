import { type ClientReadableStream } from '@grpc/grpc-js';

import { type HeroRequest } from '../generated/hero.js';
import { type HeroClient } from '../models/HeroClient.js';
import {
  type HeroResponse,
  isHeroResponseList,
} from '../models/HeroResponse.js';
import { readStreamMessages } from './readStreamMessages.js';

export async function listHeroes(
  client: HeroClient,
  id: string,
): Promise<HeroResponse[]> {
  const request: HeroRequest = {
    id,
  };
  const stream: ClientReadableStream<HeroResponse> = client.listHeroes(request);
  const messages: unknown[] = await readStreamMessages(stream);

  if (!isHeroResponseList(messages)) {
    throw new Error('Expected hero responses');
  }

  return messages;
}
