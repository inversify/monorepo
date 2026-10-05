import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { setServerRequest } from '../../../server/actions/setServerRequest.js';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail.js';
import { Server } from '../../../server/models/Server.js';
import { WarriorsDeleteHeadersController } from '../controllers/WarriorsDeleteHeadersController.js';
import { WarriorsDeleteHeadersNamedController } from '../controllers/WarriorsDeleteHeadersNamedController.js';
import { WarriorsGetHeadersController } from '../controllers/WarriorsGetHeadersController.js';
import { WarriorsGetHeadersNamedController } from '../controllers/WarriorsGetHeadersNamedController.js';
import { WarriorsOptionsHeadersController } from '../controllers/WarriorsOptionsHeadersController.js';
import { WarriorsOptionsHeadersNamedController } from '../controllers/WarriorsOptionsHeadersNamedController.js';
import { WarriorsPatchHeadersController } from '../controllers/WarriorsPatchHeadersController.js';
import { WarriorsPatchHeadersNamedController } from '../controllers/WarriorsPatchHeadersNamedController.js';
import { WarriorsPostHeadersController } from '../controllers/WarriorsPostHeadersController.js';
import { WarriorsPostHeadersNamedController } from '../controllers/WarriorsPostHeadersNamedController.js';
import { WarriorsPutHeadersController } from '../controllers/WarriorsPutHeadersController.js';
import { WarriorsPutHeadersNamedController } from '../controllers/WarriorsPutHeadersNamedController.js';

function getMethodWarriorHeadersController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteHeadersController;
    case HttpMethod.get:
      return WarriorsGetHeadersController;
    case HttpMethod.options:
      return WarriorsOptionsHeadersController;
    case HttpMethod.patch:
      return WarriorsPatchHeadersController;
    case HttpMethod.post:
      return WarriorsPostHeadersController;
    case HttpMethod.put:
      return WarriorsPutHeadersController;
  }
}

function getMethodWarriorHeadersNamedController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteHeadersNamedController;
    case HttpMethod.get:
      return WarriorsGetHeadersNamedController;
    case HttpMethod.options:
      return WarriorsOptionsHeadersNamedController;
    case HttpMethod.patch:
      return WarriorsPatchHeadersNamedController;
    case HttpMethod.post:
      return WarriorsPostHeadersNamedController;
    case HttpMethod.put:
      return WarriorsPutHeadersNamedController;
  }
}

function givenWarriorRequestWithHeadersForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverAlias?: string,
): void {
  const parsedServerAlias: string = serverAlias ?? defaultAlias;

  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    headers: {
      'x-test-header': 'test-value',
    },
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

function givenWarriorHeadersControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorHeadersController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorHeadersNamedControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorHeadersNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with headers decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorHeadersControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with headers decorator with parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorHeadersNamedControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with headers',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithHeadersForServer.bind(this)(httpMethod);
  },
);
