import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { type InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { type RequestParameter } from '../../../http/models/RequestParameter.js';
import { type ResponseParameter } from '../../../http/models/ResponseParameter.js';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail.js';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail.js';
import { type WarriorWithId } from '../models/WarriorWithId.js';

async function thenResponseContainsTheCorrectUrlParameters(
  this: InversifyHttpWorld,
  requestAlias?: string,
  responseAlias?: string,
): Promise<void> {
  const parsedRequestAlias: string = requestAlias ?? 'default';
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const requestParameter: RequestParameter =
    getServerRequestOrFail.bind(this)(parsedRequestAlias);
  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  const warriorWithId: WarriorWithId = responseParameter.body as WarriorWithId;

  assert(
    warriorWithId.id ===
      (requestParameter.urlParameters as { warrior: string }).warrior,
  );
}

Then<InversifyHttpWorld>(
  'the response contains the correct URL parameters',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheCorrectUrlParameters.bind(this)();
  },
);
