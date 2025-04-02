import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../http/models/HttpMethod';
import { setServerRequest } from '../../server/actions/setServerRequest';
import { getServerOrFail } from '../../server/calculations/getServerOrFail';
import { Server } from '../../server/models/Server';
import { WarriorsDeleteController } from '../controllers/WarriorsDeleteController';
import { WarriorsDeleteParamsController } from '../controllers/WarriorsDeleteParamsController';
import { WarriorsDeleteParamsNamedController } from '../controllers/WarriorsDeleteParamsNamedController';
import { WarriorsGetController } from '../controllers/WarriorsGetController';
import { WarriorsGetParamsController } from '../controllers/WarriorsGetParamsController';
import { WarriorsGetParamsNamedController } from '../controllers/WarriorsGetParamsNamedController';
import { WarriorsOptionsController } from '../controllers/WarriorsOptionsController';
import { WarriorsPatchController } from '../controllers/WarriorsPatchController';
import { WarriorsPatchParamsController } from '../controllers/WarriorsPatchParamsController';
import { WarriorsPatchParamsNamedController } from '../controllers/WarriorsPatchParamsNamedController';
import { WarriorsPostController } from '../controllers/WarriorsPostController';
import { WarriorsPostParamsController } from '../controllers/WarriorsPostParamsController';
import { WarriorsPostParamsNamedController } from '../controllers/WarriorsPostParamsNamedController';
import { WarriorsPutController } from '../controllers/WarriorsPutController';
import { WarriorsPutParamsController } from '../controllers/WarriorsPutParamsController';
import { WarriorsPutParamsNamedController } from '../controllers/WarriorsPutParamsNamedController';

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
