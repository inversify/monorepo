import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { Server } from '../models/Server.js';

export function setServer(
  this: InversifyHttpWorld,
  alias: string,
  server: Server,
): void {
  this.entities.servers.set(alias, server);
}
