import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { Writable } from '../../common/models/Writable.js';

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
  this.globalInterceptors = new Map();
  this.globalMiddlewares = new Map();
  this.serverRequests = new Map();
  this.serverResponses = new Map();
}
