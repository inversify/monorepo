import { After } from '@cucumber/cucumber';

import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';

After<InversifyGrpcWorld>(async function (): Promise<void> {
  for (const client of this.clients.values()) {
    client.close();
  }

  for (const server of this.entities.servers.values()) {
    await server.shutdown();
  }
});
