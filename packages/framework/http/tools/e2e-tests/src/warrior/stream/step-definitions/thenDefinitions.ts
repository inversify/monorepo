import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseBodyContainsStreamedData(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';
  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  const expectedContent: string = 'this is the content of the stream';

  assert.strictEqual(
    responseParameter.body,
    expectedContent,
    `Expected response body to be "${expectedContent}", but got "${String(responseParameter.body)}"`,
  );
}

Then<InversifyHttpWorld>(
  'the response body contains the streamed data',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseBodyContainsStreamedData.bind(this)();
  },
);
