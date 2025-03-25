import { When } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { getServerRequestOrFail } from '../../server/calculations/getServerRequestOrFail';

async function whenRequestIsSend(
  this: InversifyHttpWorld,
  requestAlias?: string,
): Promise<void> {
  const parsedRequestAlias: string = requestAlias ?? 'default';

  const request: Request =
    getServerRequestOrFail.bind(this)(parsedRequestAlias);

  const response: Response = await fetch(request);

  this.serverResponses.set(parsedRequestAlias, response);
}

When<InversifyHttpWorld>(
  'the request is send',
  async function (this: InversifyHttpWorld): Promise<void> {
    return whenRequestIsSend.bind(this)();
  },
);
