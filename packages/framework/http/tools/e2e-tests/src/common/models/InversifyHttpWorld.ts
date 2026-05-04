import { IWorld } from '@cucumber/cucumber';
import { Interceptor, Middleware } from '@inversifyjs/http-core';
import { ServiceIdentifier } from 'inversify';
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
  readonly globalInterceptors: Map<string, ServiceIdentifier<Interceptor>[]>;
  readonly globalMiddlewares: Map<string, ServiceIdentifier<Middleware>[]>;
  readonly serverRequests: Map<string, RequestParameter>;
  readonly serverResponses: Map<string, ResponseParameter>;
}
