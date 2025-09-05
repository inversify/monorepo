import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseStatusCodeIsForbidden(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert.strictEqual(
    responseParameter.statusCode,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    403,
    `Expected status code to be 403, but got ${String(responseParameter.statusCode)}`,
  );
}

Then<InversifyHttpWorld>(
  'the response status code is FORBIDDEN',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIsForbidden.bind(this)();
  },
);
