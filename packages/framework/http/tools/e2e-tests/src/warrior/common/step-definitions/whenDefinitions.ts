import { When } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { RequestParameter } from '../../../http/models/RequestParameter';
import { setServerResponse } from '../../../server/actions/setServerResponse';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail';

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
