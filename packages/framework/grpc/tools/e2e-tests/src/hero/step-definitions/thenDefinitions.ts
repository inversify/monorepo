import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { ChatMessage } from '../generated/hero.js';
import { isChatMessageList } from '../models/ChatMessage.js';
import {
  type HeroResponse,
  isHeroResponse,
  isHeroResponseList,
} from '../models/HeroResponse.js';
import { isUploadResponse } from '../models/UploadResponse.js';

function thenHeroNameIs(this: InversifyGrpcWorld, name: string): void {
  const response: unknown = this.rpcResponses.get(defaultAlias);

  if (!isHeroResponse(response)) {
    throw new Error('Expected a hero response');
  }

  assert.strictEqual(response.name, name);
}

function thenUploadedHeroNamesAre(
  this: InversifyGrpcWorld,
  firstName: string,
  secondName: string,
): void {
  const response: unknown = this.rpcResponses.get(defaultAlias);

  if (!isUploadResponse(response)) {
    throw new Error('Expected an upload response');
  }

  assert.deepStrictEqual(response.names, [firstName, secondName]);
}

function thenHeroNamesAre(
  this: InversifyGrpcWorld,
  firstName: string,
  secondName: string,
): void {
  const response: unknown = this.rpcResponses.get(defaultAlias);

  if (!isHeroResponseList(response)) {
    throw new Error('Expected hero responses');
  }

  assert.deepStrictEqual(
    response.map((heroResponse: HeroResponse): string => heroResponse.name),
    [firstName, secondName],
  );
}

function thenChatMessagesAre(
  this: InversifyGrpcWorld,
  firstText: string,
  secondText: string,
): void {
  const response: unknown = this.rpcResponses.get(defaultAlias);

  if (!isChatMessageList(response)) {
    throw new Error('Expected chat messages');
  }

  assert.deepStrictEqual(
    response.map((message: ChatMessage): string => message.text),
    [firstText, secondText],
  );
}

Then<InversifyGrpcWorld>(
  'the hero name is {string}',
  function (this: InversifyGrpcWorld, name: string): void {
    thenHeroNameIs.bind(this)(name);
  },
);

Then<InversifyGrpcWorld>(
  'the uploaded hero names are {string} and {string}',
  function (
    this: InversifyGrpcWorld,
    firstName: string,
    secondName: string,
  ): void {
    thenUploadedHeroNamesAre.bind(this)(firstName, secondName);
  },
);

Then<InversifyGrpcWorld>(
  'the hero names are {string} and {string}',
  function (
    this: InversifyGrpcWorld,
    firstName: string,
    secondName: string,
  ): void {
    thenHeroNamesAre.bind(this)(firstName, secondName);
  },
);

Then<InversifyGrpcWorld>(
  'the chat messages are {string} and {string}',
  function (
    this: InversifyGrpcWorld,
    firstText: string,
    secondText: string,
  ): void {
    thenChatMessagesAre.bind(this)(firstText, secondText);
  },
);
