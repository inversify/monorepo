import { IWorld } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { Server } from '../../server/models/Server.js';

interface EntitiesMap {
  readonly containers: Map<string, Container>;
  readonly servers: Map<string, Server>;
}

interface GrpcClient {
  close: () => void;
}

export interface InversifyGrpcWorld extends IWorld {
  readonly clients: Map<string, GrpcClient>;
  readonly entities: EntitiesMap;
  readonly rpcResponses: Map<string, unknown>;
}
