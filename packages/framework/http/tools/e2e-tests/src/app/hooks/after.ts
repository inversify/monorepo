import { After } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';

After<InversifyHttpWorld>(async function () {
  for (const server of this.entities.servers.values()) {
    await server.shutdown();
  }
});
