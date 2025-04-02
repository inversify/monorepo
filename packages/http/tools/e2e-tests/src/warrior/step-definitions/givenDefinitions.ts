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
import { WarriorsDeleteParamIdController } from '../controllers/WarriorsDeleteParamIdController';
import { WarriorsGetController } from '../controllers/WarriorsGetController';
import { WarriorsGetParamIdController } from '../controllers/WarriorsGetParamIdController';
import { WarriorsOptionsController } from '../controllers/WarriorsOptionsController';
import { WarriorsOptionsParamIdController } from '../controllers/WarriorsOptionsParamIdController';
import { WarriorsPatchController } from '../controllers/WarriorsPatchController';
import { WarriorsPatchParamIdController } from '../controllers/WarriorsPatchParamIdController';
import { WarriorsPostController } from '../controllers/WarriorsPostController';
import { WarriorsPostParamIdController } from '../controllers/WarriorsPostParamIdController';
import { WarriorsPutController } from '../controllers/WarriorsPutController';
import { WarriorsPutParamIdController } from '../controllers/WarriorsPutParamIdController';

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

function getMethodWarriorControllerWithParamId(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteParamIdController;
    case HttpMethod.get:
      return WarriorsGetParamIdController;
    case HttpMethod.options:
      return WarriorsOptionsParamIdController;
    case HttpMethod.patch:
      return WarriorsPatchParamIdController;
    case HttpMethod.post:
      return WarriorsPostParamIdController;
    case HttpMethod.put:
      return WarriorsPutParamIdController;
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

function givenWarriorRequestWithParamIdForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  id: string,
  serverAlias?: string,
): void {
  const parsedServerAlias: string = serverAlias ?? defaultAlias;

  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors/${id}`;

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

function givenWarriorControllerWithParamIdForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorControllerWithParamId(method);

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

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warrior controller with param id for container',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorControllerWithParamIdForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors with param "{paramId}" HTTP request',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    paramId: string,
  ): void {
    givenWarriorRequestWithParamIdForServer.bind(this)(httpMethod, paramId);
  },
);
