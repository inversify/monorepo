import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { Server } from '../models/Server';

export function setServer(
  this: InversifyHttpWorld,
  alias: string,
  server: Server,
): void {
  this.entities.servers.set(alias, server);
}
