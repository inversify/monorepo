import { When } from '@cucumber/cucumber';
import {
  credentials,
  makeClientConstructor,
  ServiceClientConstructor,
} from '@grpc/grpc-js';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { getServerOrFail } from '../../server/calculations/getServerOrFail.js';
import { Server } from '../../server/models/Server.js';
import { getHero } from '../actions/getHero.js';
import { HeroClient } from '../models/HeroClient.js';
import { HeroResponse } from '../models/HeroResponse.js';
import { heroServiceDefinition } from '../models/HeroService.js';

function isHeroClient(client: object): client is HeroClient {
  if (!('GetHero' in client) || !('close' in client)) {
    return false;
  }

  const getHeroMethod: unknown = client.GetHero;
  const close: unknown = client.close;

  return typeof getHeroMethod === 'function' && typeof close === 'function';
}

function buildHeroClient(address: string): HeroClient {
  const heroClientConstructor: ServiceClientConstructor = makeClientConstructor(
    heroServiceDefinition,
    'HeroService',
  );
  const client: InstanceType<ServiceClientConstructor> =
    new heroClientConstructor(address, credentials.createInsecure());

  if (!isHeroClient(client)) {
    throw new Error('Expected a hero client');
  }

  return client;
}

async function whenGetHeroRequestIsSent(
  this: InversifyGrpcWorld,
  id: string,
): Promise<void> {
  const server: Server = getServerOrFail.bind(this)(defaultAlias);
  const address: string = `${server.host}:${server.port.toString()}`;
  const client: HeroClient = buildHeroClient(address);

  this.clients.set(defaultAlias, client);

  const response: HeroResponse = await getHero(client, id);

  this.rpcResponses.set(defaultAlias, response);
}

When<InversifyGrpcWorld>(
  'a GetHero request with id {string} is sent',
  async function (this: InversifyGrpcWorld, id: string): Promise<void> {
    await whenGetHeroRequestIsSent.bind(this)(id);
  },
);
