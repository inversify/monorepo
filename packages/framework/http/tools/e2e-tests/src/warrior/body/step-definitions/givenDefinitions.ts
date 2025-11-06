import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { setServerRequest } from '../../../server/actions/setServerRequest';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail';
import { Server } from '../../../server/models/Server';
import { WarriorsDeleteJsonBodyController } from '../controllers/WarriorsDeleteJsonBodyController';
import { WarriorsDeleteJsonBodyNamedController } from '../controllers/WarriorsDeleteJsonBodyNamedController';
import { WarriorsDeleteStringBodyController } from '../controllers/WarriorsDeleteStringBodyController';
import { WarriorsOptionsJsonBodyController } from '../controllers/WarriorsOptionsJsonBodyController';
import { WarriorsOptionsJsonBodyNamedController } from '../controllers/WarriorsOptionsJsonBodyNamedController';
import { WarriorsOptionsStringBodyController } from '../controllers/WarriorsOptionsStringBodyController';
import { WarriorsPatchJsonBodyController } from '../controllers/WarriorsPatchJsonBodyController';
import { WarriorsPatchJsonBodyNamedController } from '../controllers/WarriorsPatchJsonBodyNamedController';
import { WarriorsPatchStringBodyController } from '../controllers/WarriorsPatchStringBodyController';
import { WarriorsPostJsonBodyController } from '../controllers/WarriorsPostJsonBodyController';
import { WarriorsPostJsonBodyNamedController } from '../controllers/WarriorsPostJsonBodyNamedController';
import { WarriorsPostStringBodyController } from '../controllers/WarriorsPostStringBodyController';
import { WarriorsPutJsonBodyController } from '../controllers/WarriorsPutJsonBodyController';
import { WarriorsPutJsonBodyNamedController } from '../controllers/WarriorsPutJsonBodyNamedController';
import { WarriorsPutStringBodyController } from '../controllers/WarriorsPutStringBodyController';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';
import { WarriorRequest } from '../models/WarriorRequest';

function getMethodWarriorJsonBodyController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteJsonBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsJsonBodyController;
    case HttpMethod.patch:
      return WarriorsPatchJsonBodyController;
    case HttpMethod.post:
      return WarriorsPostJsonBodyController;
    case HttpMethod.put:
      return WarriorsPutJsonBodyController;
  }
}

function getMethodWarriorJsonBodyNamedController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteJsonBodyNamedController;
    case HttpMethod.get:
      throw new Error('Get not supported for body named controller');
    case HttpMethod.options:
      return WarriorsOptionsJsonBodyNamedController;
    case HttpMethod.patch:
      return WarriorsPatchJsonBodyNamedController;
    case HttpMethod.post:
      return WarriorsPostJsonBodyNamedController;
    case HttpMethod.put:
      return WarriorsPutJsonBodyNamedController;
  }
}

function getMethodWarriorStringBodyController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteStringBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsStringBodyController;
    case HttpMethod.patch:
      return WarriorsPatchStringBodyController;
    case HttpMethod.post:
      return WarriorsPostStringBodyController;
    case HttpMethod.put:
      return WarriorsPutStringBodyController;
  }
}

function givenWarriorRequestWithEmptyStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    body: '',
    headers: {
      'Content-Type': 'text/plain',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: '',
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithJsonBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const requestInit: RequestInit = {
    body: JSON.stringify(warriorRequest),
    headers: {
      'Content-Type': 'application/json',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorJsonBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorBodyNamedControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorJsonBodyNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorStringBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorStringBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with body decorator with parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorBodyNamedControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with string body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStringBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with JSON body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithJsonBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with empty string body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithEmptyStringBodyForServer.bind(this)(httpMethod);
  },
);
