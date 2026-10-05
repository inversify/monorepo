import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { Writable } from '../../common/models/Writable.js';

export function initializeWorld(
  this: Writable<Partial<InversifyGrpcWorld>>,
): void {
  this.clients = new Map();
  this.entities = {
    containers: new Map(),
    servers: new Map(),
  };
  this.rpcResponses = new Map();
}
