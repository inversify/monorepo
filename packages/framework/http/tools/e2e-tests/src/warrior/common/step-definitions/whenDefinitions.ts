import { When } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { RequestParameter } from '../../../http/models/RequestParameter.js';
import { setServerResponse } from '../../../server/actions/setServerResponse.js';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail.js';

async function whenRequestIsSend(
  this: InversifyHttpWorld,
  requestAlias?: string,
): Promise<void> {
  const parsedRequestAlias: string = requestAlias ?? 'default';

  const requestParameter: RequestParameter =
    getServerRequestOrFail.bind(this)(parsedRequestAlias);

  const response: Response = await fetch(requestParameter.request);

  await setServerResponse.bind(this)(parsedRequestAlias, response);
}

When<InversifyHttpWorld>(
  'the request is send',
  async function (this: InversifyHttpWorld): Promise<void> {
    return whenRequestIsSend.bind(this)();
  },
);
