import { When } from '@cucumber/cucumber';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { getServerOrFail } from '../../server/calculations/getServerOrFail.js';
import { Server } from '../../server/models/Server.js';
import { buildHeroClient } from '../actions/buildHeroClient.js';
import { chat } from '../actions/chat.js';
import { getHero } from '../actions/getHero.js';
import { listHeroes } from '../actions/listHeroes.js';
import { uploadHeroes } from '../actions/uploadHeroes.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { HeroClient } from '../models/HeroClient.js';
import { HeroResponse } from '../models/HeroResponse.js';
import { UploadResponse } from '../models/UploadResponse.js';

function openHeroClient(this: InversifyGrpcWorld): HeroClient {
  const server: Server = getServerOrFail.bind(this)(defaultAlias);
  const address: string = `${server.host}:${server.port.toString()}`;
  const client: HeroClient = buildHeroClient(address);

  this.clients.set(defaultAlias, client);

  return client;
}

async function whenGetHeroRequestIsSent(
  this: InversifyGrpcWorld,
  id: string,
): Promise<void> {
  const client: HeroClient = openHeroClient.bind(this)();
  const response: HeroResponse = await getHero(client, id);

  this.rpcResponses.set(defaultAlias, response);
}

async function whenUploadHeroesRequestIsSent(
  this: InversifyGrpcWorld,
  firstName: string,
  secondName: string,
): Promise<void> {
  const client: HeroClient = openHeroClient.bind(this)();
  const response: UploadResponse = await uploadHeroes(client, [
    firstName,
    secondName,
  ]);

  this.rpcResponses.set(defaultAlias, response);
}

async function whenListHeroesRequestIsSent(
  this: InversifyGrpcWorld,
  id: string,
): Promise<void> {
  const client: HeroClient = openHeroClient.bind(this)();
  const responses: HeroResponse[] = await listHeroes(client, id);

  this.rpcResponses.set(defaultAlias, responses);
}

async function whenChatRequestIsSent(
  this: InversifyGrpcWorld,
  firstText: string,
  secondText: string,
): Promise<void> {
  const client: HeroClient = openHeroClient.bind(this)();
  const messages: ChatMessage[] = await chat(client, [firstText, secondText]);

  this.rpcResponses.set(defaultAlias, messages);
}

When<InversifyGrpcWorld>(
  'a GetHero request with id {string} is sent',
  async function (this: InversifyGrpcWorld, id: string): Promise<void> {
    await whenGetHeroRequestIsSent.bind(this)(id);
  },
);

When<InversifyGrpcWorld>(
  'an UploadHeroes request with names {string} and {string} is sent',
  async function (
    this: InversifyGrpcWorld,
    firstName: string,
    secondName: string,
  ): Promise<void> {
    await whenUploadHeroesRequestIsSent.bind(this)(firstName, secondName);
  },
);

When<InversifyGrpcWorld>(
  'a ListHeroes request with id {string} is sent',
  async function (this: InversifyGrpcWorld, id: string): Promise<void> {
    await whenListHeroesRequestIsSent.bind(this)(id);
  },
);

When<InversifyGrpcWorld>(
  'a Chat request with messages {string} and {string} is sent',
  async function (
    this: InversifyGrpcWorld,
    firstText: string,
    secondText: string,
  ): Promise<void> {
    await whenChatRequestIsSent.bind(this)(firstText, secondText);
  },
);
