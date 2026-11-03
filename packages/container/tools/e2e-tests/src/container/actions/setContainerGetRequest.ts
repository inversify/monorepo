import { type InversifyWorld } from '../../common/models/InversifyWorld';

export function setContainerGetRequest(
  this: InversifyWorld,
  alias: string,
  result: unknown,
): void {
  this.containerRequests.get.set(alias, result);
}
