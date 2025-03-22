import { IWorld } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { Server } from '../../server/models/Server';

interface EntitiesMap {
  readonly containers: Map<string, Container>;
  readonly servers: Map<string, Server>;
}

interface ContainerRequests {
  get: Map<string, unknown>;
}

export interface InversifyHttpWorld extends IWorld {
  readonly containerRequests: ContainerRequests;
  readonly entities: EntitiesMap;
}
