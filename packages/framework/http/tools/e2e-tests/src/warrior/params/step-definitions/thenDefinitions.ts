import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { RequestParameter } from '../../../http/models/RequestParameter';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';
import { WarriorWithId } from '../models/WarriorWithId';

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
