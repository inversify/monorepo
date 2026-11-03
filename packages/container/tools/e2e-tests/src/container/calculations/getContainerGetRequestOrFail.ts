import { type InversifyWorld } from '../../common/models/InversifyWorld';

export function getContainerGetRequestOrFail(
  this: InversifyWorld,
  alias: string,
): unknown {
  if (!this.containerRequests.get.has(alias)) {
    throw new Error(
      `Expected "${alias}" aliased container get request not found`,
    );
  }

  return this.containerRequests.get.get(alias);
}
