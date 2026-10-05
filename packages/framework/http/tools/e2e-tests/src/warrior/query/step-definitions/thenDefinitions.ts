import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { RequestParameter } from '../../../http/models/RequestParameter.js';
import { ResponseParameter } from '../../../http/models/ResponseParameter.js';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail.js';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail.js';
import { WarriorWithQuery } from '../models/WarriorWithQuery.js';

async function thenResponseContainsTheCorrectUrlQueryParametersByName(
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

  const warriorWithQuery: WarriorWithQuery =
    responseParameter.body as WarriorWithQuery;

  assert.ok(
    warriorWithQuery.filter ===
      (requestParameter.queryParameters as { filter: [string] }).filter[0],
  );
}

Then<InversifyHttpWorld>(
  'the response contains the correct URL query parameters',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheCorrectUrlQueryParametersByName.bind(this)();
  },
);
