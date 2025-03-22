import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';

export function setContainerGetRequest(
  this: InversifyHttpWorld,
  alias: string,
  result: unknown,
): void {
  this.containerRequests.get.set(alias, result);
}
