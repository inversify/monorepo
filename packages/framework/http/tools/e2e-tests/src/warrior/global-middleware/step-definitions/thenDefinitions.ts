import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseContainsGlobalHeader(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert(
    responseParameter.response.headers.has('x-global') &&
      responseParameter.response.headers.get('x-global') === '1',
    `Expected response header x-global: 1, but got: ${responseParameter.response.headers.get('x-global') ?? '(not present)'}`,
  );
}

async function thenResponseContainsAccessControlAllowOriginHeader(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert(
    responseParameter.response.headers.has('access-control-allow-origin'),
    `Expected response header access-control-allow-origin to be present`,
  );
}

Then<InversifyHttpWorld>(
  'the response contains the X-Global header',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsGlobalHeader.bind(this)();
  },
);

Then<InversifyHttpWorld>(
  'the response contains the Access-Control-Allow-Origin header',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsAccessControlAllowOriginHeader.bind(this)();
  },
);
