import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { RequestParameter } from '../../http/models/RequestParameter.js';

export function getServerRequestOrFail(
  this: InversifyHttpWorld,
  alias: string,
): RequestParameter {
  const request: RequestParameter | undefined = this.serverRequests.get(alias);

  if (request === undefined) {
    throw new Error('Server request not found');
  }

  return request;
}
