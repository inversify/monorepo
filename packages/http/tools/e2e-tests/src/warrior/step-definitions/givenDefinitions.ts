import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../http/models/HttpMethod';
import { setServerRequest } from '../../server/actions/setServerRequest';
import { getServerOrFail } from '../../server/calculations/getServerOrFail';
import { Server } from '../../server/models/Server';
import { WarriorsDeleteBodyController } from '../controllers/WarriorsDeleteBodyController';
import { WarriorsDeleteBodyNamedController } from '../controllers/WarriorsDeleteBodyNamedController';
import { WarriorsDeleteController } from '../controllers/WarriorsDeleteController';
import { WarriorsDeleteParamsController } from '../controllers/WarriorsDeleteParamsController';
import { WarriorsDeleteParamsNamedController } from '../controllers/WarriorsDeleteParamsNamedController';
import { WarriorsGetController } from '../controllers/WarriorsGetController';
import { WarriorsGetParamsController } from '../controllers/WarriorsGetParamsController';
import { WarriorsGetParamsNamedController } from '../controllers/WarriorsGetParamsNamedController';
import { WarriorsOptionsBodyController } from '../controllers/WarriorsOptionsBodyController';
import { WarriorsOptionsBodyNamedController } from '../controllers/WarriorsOptionsBodyNamedController';
import { WarriorsOptionsController } from '../controllers/WarriorsOptionsController';
import { WarriorsPatchBodyController } from '../controllers/WarriorsPatchBodyController';
import { WarriorsPatchBodyNamedController } from '../controllers/WarriorsPatchBodyNamedController';
import { WarriorsPatchController } from '../controllers/WarriorsPatchController';
import { WarriorsPatchParamsController } from '../controllers/WarriorsPatchParamsController';
import { WarriorsPatchParamsNamedController } from '../controllers/WarriorsPatchParamsNamedController';
import { WarriorsPostBodyController } from '../controllers/WarriorsPostBodyController';
import { WarriorsPostBodyNamedController } from '../controllers/WarriorsPostBodyNamedController';
import { WarriorsPostController } from '../controllers/WarriorsPostController';
import { WarriorsPostParamsController } from '../controllers/WarriorsPostParamsController';
import { WarriorsPostParamsNamedController } from '../controllers/WarriorsPostParamsNamedController';
import { WarriorsPutBodyController } from '../controllers/WarriorsPutBodyController';
import { WarriorsPutBodyNamedController } from '../controllers/WarriorsPutBodyNamedController';
import { WarriorsPutController } from '../controllers/WarriorsPutController';
import { WarriorsPutParamsController } from '../controllers/WarriorsPutParamsController';
import { WarriorsPutParamsNamedController } from '../controllers/WarriorsPutParamsNamedController';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';
import { WarriorRequest } from '../models/WarriorRequest';

function getMethodWarriorController(method: HttpMethod): NewableFunction {
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

function getMethodWarriorParamsController(method: HttpMethod): NewableFunction {
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

function getMethodWarriorParamsNamedController(
  method: HttpMethod,
): NewableFunction {
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

function getMethodWarriorBodyController(method: HttpMethod): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsBodyController;
    case HttpMethod.patch:
      return WarriorsPatchBodyController;
    case HttpMethod.post:
      return WarriorsPostBodyController;
    case HttpMethod.put:
      return WarriorsPutBodyController;
  }
}

function getMethodWarriorBodyNamedController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteBodyNamedController;
    case HttpMethod.get:
      throw new Error('Get not supported for body named controller');
    case HttpMethod.options:
      return WarriorsOptionsBodyNamedController;
    case HttpMethod.patch:
      return WarriorsPatchBodyNamedController;
    case HttpMethod.post:
      return WarriorsPostBodyNamedController;
    case HttpMethod.put:
      return WarriorsPutBodyNamedController;
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
  setServerRequest.bind(this)(parsedServerAlias, request);
}

function givenWarriorRequestWithParamsForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverAlias?: string,
): void {
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors/123`;

  const requestInit: RequestInit = {
    method,
  };

  const request: Request = new Request(url, requestInit);
  setServerRequest.bind(this)(parsedServerAlias, request);
}

function givenWarriorRequestWithBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverAlias?: string,
): void {
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
  setServerRequest.bind(this)(parsedServerAlias, request);
}

function givenWarriorControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction = getMethodWarriorController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorParamsControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction = getMethodWarriorParamsController(method);

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

  const controller: NewableFunction =
    getMethodWarriorParamsNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction = getMethodWarriorBodyController(method);

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
    getMethodWarriorBodyNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warrior controller for container',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorControllerForContainer.bind(this)(httpMethod);
  },
);

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
  'a "{httpMethod}" warriors HTTP request',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with parameters',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithParamsForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithBodyForServer.bind(this)(httpMethod);
  },
);
