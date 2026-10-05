import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { Server } from '../models/Server.js';

export function getServerOrFail(
  this: InversifyHttpWorld,
  alias: string,
): Server {
  const server: Server | undefined = this.entities.servers.get(alias);

  if (server === undefined) {
    throw new Error('Server not found');
  }

  return server;
}
