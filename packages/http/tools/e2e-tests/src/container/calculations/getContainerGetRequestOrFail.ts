import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';

export function getContainerGetRequestOrFail(
  this: InversifyHttpWorld,
  alias: string,
): unknown {
  if (!this.containerRequests.get.has(alias)) {
    throw new Error(
      `Expected "${alias}" aliased container get request not found`,
    );
  }

  return this.containerRequests.get.get(alias);
}
