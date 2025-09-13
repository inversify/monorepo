import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { RequestParameter } from '../../http/models/RequestParameter';

export function setServerRequest(
  this: InversifyHttpWorld,
  alias: string,
  request: RequestParameter,
): void {
  this.serverRequests.set(alias, request);
}
