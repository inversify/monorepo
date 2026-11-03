import { type IWorld } from '@cucumber/cucumber';
import { type Interceptor, type Middleware } from '@inversifyjs/http-core';
import { type ServiceIdentifier } from 'inversify';
import { type Container } from 'inversify';

import { type RequestParameter } from '../../http/models/RequestParameter.js';
import { type ResponseParameter } from '../../http/models/ResponseParameter.js';
import { type Server } from '../../server/models/Server.js';

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
  readonly globalInterceptors: Map<string, ServiceIdentifier<Interceptor>[]>;
  readonly globalMiddlewares: Map<string, ServiceIdentifier<Middleware>[]>;
  readonly serverRequests: Map<string, RequestParameter>;
  readonly serverResponses: Map<string, ResponseParameter>;
}
