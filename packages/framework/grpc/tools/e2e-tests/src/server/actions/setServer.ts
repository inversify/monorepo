import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { Server } from '../models/Server.js';

export function setServer(
  this: InversifyGrpcWorld,
  alias: string,
  server: Server,
): void {
  this.entities.servers.set(alias, server);
}
