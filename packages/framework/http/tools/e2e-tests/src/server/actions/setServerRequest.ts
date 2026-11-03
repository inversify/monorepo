import { type InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { type RequestParameter } from '../../http/models/RequestParameter.js';

export function setServerRequest(
  this: InversifyHttpWorld,
  alias: string,
  request: RequestParameter,
): void {
  this.serverRequests.set(alias, request);
}
