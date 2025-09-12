import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseContainsTheCorrectInterceptorHeader(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert(
    responseParameter.response.headers.has('x-warrior-route') &&
      responseParameter.response.headers.get('x-warrior-route') === 'true',
  );
}

Then<InversifyHttpWorld>(
  'the response contains the correct interceptor header',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheCorrectInterceptorHeader.bind(this)();
  },
);
