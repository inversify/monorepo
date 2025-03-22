import { Container } from 'inversify';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';

export function getContainerOrFail(
  this: InversifyHttpWorld,
  alias: string,
): Container {
  const container: Container | undefined = this.entities.containers.get(alias);

  if (container === undefined) {
    throw new Error(`Expected "${alias}" aliased container not found`);
  }

  return container;
}
