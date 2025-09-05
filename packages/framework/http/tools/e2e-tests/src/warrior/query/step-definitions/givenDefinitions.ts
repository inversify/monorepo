import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { setServerRequest } from '../../../server/actions/setServerRequest';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail';
import { Server } from '../../../server/models/Server';
import { WarriorsDeleteQueryController } from '../controllers/WarriorsDeleteQueryController';
import { WarriorsDeleteQueryNamedController } from '../controllers/WarriorsDeleteQueryNamedController';
import { WarriorsGetQueryController } from '../controllers/WarriorsGetQueryController';
import { WarriorsGetQueryNamedController } from '../controllers/WarriorsGetQueryNamedController';
import { WarriorsOptionsQueryController } from '../controllers/WarriorsOptionsQueryController';
import { WarriorsOptionsQueryNamedController } from '../controllers/WarriorsOptionsQueryNamedController';
import { WarriorsPatchQueryController } from '../controllers/WarriorsPatchQueryController';
import { WarriorsPatchQueryNamedController } from '../controllers/WarriorsPatchQueryNamedController';
import { WarriorsPostQueryController } from '../controllers/WarriorsPostQueryController';
import { WarriorsPostQueryNamedController } from '../controllers/WarriorsPostQueryNamedController';
import { WarriorsPutQueryController } from '../controllers/WarriorsPutQueryController';
import { WarriorsPutQueryNamedController } from '../controllers/WarriorsPutQueryNamedController';

function getMethodWarriorQueryController(method: HttpMethod): NewableFunction {
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

function getMethodWarriorQueryNamedController(
  method: HttpMethod,
): NewableFunction {
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

  const controller: NewableFunction = getMethodWarriorQueryController(method);

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

  const controller: NewableFunction =
    getMethodWarriorQueryNamedController(method);

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
