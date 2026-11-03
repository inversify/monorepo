import { type Container } from '@inversifyjs/container';

import { type InversifyWorld } from '../../common/models/InversifyWorld';

export function setContainer(
  this: InversifyWorld,
  alias: string,
  container: Container,
): void {
  this.entities.containers.set(alias, container);
}
