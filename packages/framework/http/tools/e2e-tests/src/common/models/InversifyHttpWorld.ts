import { IWorld } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { RequestParameter } from '../../http/models/RequestParameter';
import { ResponseParameter } from '../../http/models/ResponseParameter';
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
  readonly serverRequests: Map<string, RequestParameter>;
  readonly serverResponses: Map<string, ResponseParameter>;
}
