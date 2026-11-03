import { type IWorld } from '@cucumber/cucumber';
import { type Container } from 'inversify';

import { type Server } from '../../server/models/Server.js';

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
