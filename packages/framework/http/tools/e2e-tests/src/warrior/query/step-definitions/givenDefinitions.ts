import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { setServerRequest } from '../../../server/actions/setServerRequest.js';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail.js';
import { Server } from '../../../server/models/Server.js';
import { WarriorsDeleteQueryController } from '../controllers/WarriorsDeleteQueryController.js';
import { WarriorsDeleteQueryNamedController } from '../controllers/WarriorsDeleteQueryNamedController.js';
import { WarriorsGetQueryController } from '../controllers/WarriorsGetQueryController.js';
import { WarriorsGetQueryNamedController } from '../controllers/WarriorsGetQueryNamedController.js';
import { WarriorsOptionsQueryController } from '../controllers/WarriorsOptionsQueryController.js';
import { WarriorsOptionsQueryNamedController } from '../controllers/WarriorsOptionsQueryNamedController.js';
import { WarriorsPatchQueryController } from '../controllers/WarriorsPatchQueryController.js';
import { WarriorsPatchQueryNamedController } from '../controllers/WarriorsPatchQueryNamedController.js';
import { WarriorsPostQueryController } from '../controllers/WarriorsPostQueryController.js';
import { WarriorsPostQueryNamedController } from '../controllers/WarriorsPostQueryNamedController.js';
import { WarriorsPutQueryController } from '../controllers/WarriorsPutQueryController.js';
import { WarriorsPutQueryNamedController } from '../controllers/WarriorsPutQueryNamedController.js';

function getMethodWarriorQueryController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteQueryController;
    case HttpMethod.get:
      return WarriorsGetQueryController;
    case HttpMethod.options:
      return WarriorsOptionsQueryController;
    case HttpMethod.patch:
      return WarriorsPatchQueryController;
    case HttpMethod.post:
      return WarriorsPostQueryController;
    case HttpMethod.put:
      return WarriorsPutQueryController;
  }
}

function getMethodWarriorQueryNamedController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteQueryNamedController;
    case HttpMethod.get:
      return WarriorsGetQueryNamedController;
    case HttpMethod.options:
      return WarriorsOptionsQueryNamedController;
    case HttpMethod.patch:
      return WarriorsPatchQueryNamedController;
    case HttpMethod.post:
      return WarriorsPostQueryNamedController;
    case HttpMethod.put:
      return WarriorsPutQueryNamedController;
  }
}

function givenWarriorRequestWithQueryForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverAlias?: string,
): void {
  const parsedServerAlias: string = serverAlias ?? defaultAlias;

  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const queryParameters: Record<string, string[]> = {
    filter: ['test'],
  };

  const stringifiedQueryParameters: string = new URLSearchParams(
    queryParameters,
  ).toString();

  const url: string = `http://${server.host}:${server.port.toString()}/warriors?${stringifiedQueryParameters}`;

  const requestInit: RequestInit = {
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedServerAlias, {
    body: undefined,
    queryParameters,
    request,
    urlParameters: {},
  });
}

function givenWarriorQueryControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorQueryController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorQueryNamedControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorQueryNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with query decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorQueryControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with query decorator with parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorQueryNamedControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with query parameters',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithQueryForServer.bind(this)(httpMethod);
  },
);
