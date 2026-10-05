import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { setServerRequest } from '../../../server/actions/setServerRequest.js';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail.js';
import { Server } from '../../../server/models/Server.js';
import { WarriorsDeleteController } from '../controllers/WarriorsDeleteController.js';
import { WarriorsGetController } from '../controllers/WarriorsGetController.js';
import { WarriorsOptionsController } from '../controllers/WarriorsOptionsController.js';
import { WarriorsPatchController } from '../controllers/WarriorsPatchController.js';
import { WarriorsPostController } from '../controllers/WarriorsPostController.js';
import { WarriorsPutController } from '../controllers/WarriorsPutController.js';

function getMethodWarriorController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteController;
    case HttpMethod.get:
      return WarriorsGetController;
    case HttpMethod.options:
      return WarriorsOptionsController;
    case HttpMethod.patch:
      return WarriorsPatchController;
    case HttpMethod.post:
      return WarriorsPostController;
    case HttpMethod.put:
      return WarriorsPutController;
  }
}

function givenWarriorRequestForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverAlias?: string,
): void {
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedServerAlias, {
    body: undefined,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warrior controller for container',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestForServer.bind(this)(httpMethod);
  },
);
