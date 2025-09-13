import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { RequestParameter } from '../../../http/models/RequestParameter';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';
import { WarriorWithQuery } from '../models/WarriorWithQuery';

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
