import { type Container } from '@inversifyjs/container';

import { type InversifyWorld } from '../../common/models/InversifyWorld';

export function getContainerOrFail(
  this: InversifyWorld,
  alias: string,
): Container {
  const container: Container | undefined = this.entities.containers.get(alias);

  if (container === undefined) {
    throw new Error(`Expected "${alias}" aliased container not found`);
  }

  return container;
}
