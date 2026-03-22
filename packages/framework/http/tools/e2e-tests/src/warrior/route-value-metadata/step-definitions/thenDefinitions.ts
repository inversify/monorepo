import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseContainsTheRouteValueMetadataHeader(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert(
    responseParameter.response.headers.has('x-route-roles') &&
      responseParameter.response.headers.get('x-route-roles') === 'admin,user',
  );
}

Then<InversifyHttpWorld>(
  'the response contains the route value metadata header',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheRouteValueMetadataHeader.bind(this)();
  },
);
