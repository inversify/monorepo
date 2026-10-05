import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { HeroResponse } from '../models/HeroResponse.js';

function isHeroResponse(value: unknown): value is HeroResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'name' in value && typeof value.name === 'string';
}

function thenHeroNameIs(this: InversifyGrpcWorld, name: string): void {
  const response: unknown = this.rpcResponses.get(defaultAlias);

  if (!isHeroResponse(response)) {
    throw new Error('Expected a hero response');
  }

  assert.strictEqual(response.name, name);
}

Then<InversifyGrpcWorld>(
  'the hero name is {string}',
  function (this: InversifyGrpcWorld, name: string): void {
    thenHeroNameIs.bind(this)(name);
  },
);
