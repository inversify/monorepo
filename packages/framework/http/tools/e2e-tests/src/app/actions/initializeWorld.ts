import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { Writable } from '../../common/models/Writable';

export function initializeWorld(
  this: Writable<Partial<InversifyHttpWorld>>,
): void {
  this.containerRequests = {
    get: new Map(),
  };
  this.entities = {
    containers: new Map(),
    servers: new Map(),
  };
  this.serverRequests = new Map();
  this.serverResponses = new Map();
}
