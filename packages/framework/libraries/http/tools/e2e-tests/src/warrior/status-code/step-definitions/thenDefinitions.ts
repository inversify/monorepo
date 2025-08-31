import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseStatusCodeIsNoContent(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';
  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);
  const responseStatus: number = responseParameter.statusCode;

  assert.strictEqual(
    responseStatus,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    204,
    `Expected status code to be 204, but got ${String(responseStatus)}`,
  );
}

Then<InversifyHttpWorld>(
  'the response status code is NO_CONTENT',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIsNoContent.bind(this)();
  },
);
