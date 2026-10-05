import {
  credentials,
  makeClientConstructor,
  type ServiceClientConstructor,
} from '@grpc/grpc-js';

import { HeroServiceService } from '../generated/hero.js';
import { type HeroClient } from '../models/HeroClient.js';

function isHeroClient(client: object): client is HeroClient {
  if (
    !('chat' in client) ||
    !('close' in client) ||
    !('getHero' in client) ||
    !('listHeroes' in client) ||
    !('uploadHeroes' in client)
  ) {
    return false;
  }

  const chat: unknown = client.chat;
  const close: unknown = client.close;
  const getHeroMethod: unknown = client.getHero;
  const listHeroes: unknown = client.listHeroes;
  const uploadHeroes: unknown = client.uploadHeroes;

  return (
    typeof chat === 'function' &&
    typeof close === 'function' &&
    typeof getHeroMethod === 'function' &&
    typeof listHeroes === 'function' &&
    typeof uploadHeroes === 'function'
  );
}

export function buildHeroClient(address: string): HeroClient {
  const heroClientConstructor: ServiceClientConstructor = makeClientConstructor(
    HeroServiceService,
    'HeroService',
  );
  const client: InstanceType<ServiceClientConstructor> =
    new heroClientConstructor(address, credentials.createInsecure());

  if (!isHeroClient(client)) {
    throw new Error('Expected a hero client');
  }

  return client;
}
