import { type Container } from 'inversify';

import { type InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';

export function setContainer(
  this: InversifyGrpcWorld,
  alias: string,
  container: Container,
): void {
  this.entities.containers.set(alias, container);
}
