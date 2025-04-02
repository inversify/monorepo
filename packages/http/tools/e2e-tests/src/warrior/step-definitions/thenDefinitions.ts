import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { getServerResponseOrFail } from '../../server/calculations/getServerResponseOrFail';
import { WarriorWithId } from '../models/WarriorWithId';

async function thenResponseContainsTheCorrectUrlParametersByName(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const response: Response =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  const warriorWithId: WarriorWithId = (await response.json()) as WarriorWithId;

  assert.ok(warriorWithId.id === '123');
}

function thenResponseStatusCodeIsSuccessful(
  this: InversifyHttpWorld,
  responseAlias?: string,
): void {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const response: Response =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  assert.ok(response.status >= 200 && response.status < 300);
}

Then<InversifyHttpWorld>(
  'the response status code is Ok-ish',
  function (): void {
    thenResponseStatusCodeIsSuccessful.bind(this)();
  },
);

Then<InversifyHttpWorld>(
  'the response contains the correct URL parameters',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheCorrectUrlParametersByName.bind(this)();
  },
);
