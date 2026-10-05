import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { setServerRequest } from '../../../server/actions/setServerRequest.js';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail.js';
import { Server } from '../../../server/models/Server.js';
import { WarriorsDeleteParamsController } from '../controllers/WarriorsDeleteParamsController.js';
import { WarriorsDeleteParamsNamedController } from '../controllers/WarriorsDeleteParamsNamedController.js';
import { WarriorsGetParamsController } from '../controllers/WarriorsGetParamsController.js';
import { WarriorsGetParamsNamedController } from '../controllers/WarriorsGetParamsNamedController.js';
import { WarriorsPatchParamsController } from '../controllers/WarriorsPatchParamsController.js';
import { WarriorsPatchParamsNamedController } from '../controllers/WarriorsPatchParamsNamedController.js';
import { WarriorsPostParamsController } from '../controllers/WarriorsPostParamsController.js';
import { WarriorsPostParamsNamedController } from '../controllers/WarriorsPostParamsNamedController.js';
import { WarriorsPutParamsController } from '../controllers/WarriorsPutParamsController.js';
import { WarriorsPutParamsNamedController } from '../controllers/WarriorsPutParamsNamedController.js';

function getMethodWarriorParamsController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteParamsController;
    case HttpMethod.get:
      return WarriorsGetParamsController;
    case HttpMethod.options:
      throw new Error('Options not supported for params controller');
    case HttpMethod.patch:
      return WarriorsPatchParamsController;
    case HttpMethod.post:
      return WarriorsPostParamsController;
    case HttpMethod.put:
      return WarriorsPutParamsController;
  }
}

function getMethodWarriorParamsNamedController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteParamsNamedController;
    case HttpMethod.get:
      return WarriorsGetParamsNamedController;
    case HttpMethod.options:
      throw new Error('Options not supported for params named controller');
    case HttpMethod.patch:
      return WarriorsPatchParamsNamedController;
    case HttpMethod.post:
      return WarriorsPostParamsNamedController;
    case HttpMethod.put:
      return WarriorsPutParamsNamedController;
  }
}

function givenWarriorRequestWithParamsForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverAlias?: string,
): void {
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const urlParameters: {
    warrior: string;
  } = {
    warrior: '123',
  };

  const url: string = `http://${server.host}:${server.port.toString()}/warriors/${urlParameters.warrior}`;

  const requestInit: RequestInit = {
    method,
  };

  const request: Request = new Request(url, requestInit);
  setServerRequest.bind(this)(parsedServerAlias, {
    body: undefined,
    queryParameters: {},
    request,
    urlParameters,
  });
}

function givenWarriorParamsControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorParamsController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorParamsNamedControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorParamsNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with params decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorParamsControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with params decorator with parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorParamsNamedControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with parameters',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithParamsForServer.bind(this)(httpMethod);
  },
);
