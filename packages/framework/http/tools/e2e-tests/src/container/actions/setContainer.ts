import { Container } from 'inversify';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';

export function setContainer(
  this: InversifyHttpWorld,
  alias: string,
  container: Container,
): void {
  this.entities.containers.set(alias, container);
}
