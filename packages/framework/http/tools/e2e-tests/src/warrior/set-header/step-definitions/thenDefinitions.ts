import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { ResponseParameter } from '../../../http/models/ResponseParameter.js';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail.js';

async function thenResponseContainsTheCorrectHeader(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert(
    responseParameter.response.headers.has('x-test-header') &&
      responseParameter.response.headers.get('x-test-header') === 'test-value',
  );
}

Then<InversifyHttpWorld>(
  'the response contains the correct header',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheCorrectHeader.bind(this)();
  },
);
