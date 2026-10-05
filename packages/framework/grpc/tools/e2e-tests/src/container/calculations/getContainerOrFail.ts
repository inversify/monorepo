import { Container } from 'inversify';

import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';

export function getContainerOrFail(
  this: InversifyGrpcWorld,
  alias: string,
): Container {
  const container: Container | undefined = this.entities.containers.get(alias);

  if (container === undefined) {
    throw new Error(`Expected "${alias}" aliased container not found`);
  }

  return container;
}
