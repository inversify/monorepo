import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { setServerRequest } from '../../../server/actions/setServerRequest';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail';
import { Server } from '../../../server/models/Server';
import { WarriorsDeleteBodyController } from '../controllers/WarriorsDeleteBodyController';
import { WarriorsDeleteBodyNamedController } from '../controllers/WarriorsDeleteBodyNamedController';
import { WarriorsOptionsBodyController } from '../controllers/WarriorsOptionsBodyController';
import { WarriorsOptionsBodyNamedController } from '../controllers/WarriorsOptionsBodyNamedController';
import { WarriorsPatchBodyController } from '../controllers/WarriorsPatchBodyController';
import { WarriorsPatchBodyNamedController } from '../controllers/WarriorsPatchBodyNamedController';
import { WarriorsPostBodyController } from '../controllers/WarriorsPostBodyController';
import { WarriorsPostBodyNamedController } from '../controllers/WarriorsPostBodyNamedController';
import { WarriorsPutBodyController } from '../controllers/WarriorsPutBodyController';
import { WarriorsPutBodyNamedController } from '../controllers/WarriorsPutBodyNamedController';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';
import { WarriorRequest } from '../models/WarriorRequest';

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

function givenWarriorRequestWithBodyForServer(
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
  'a "{httpMethod}" warriors HTTP request with body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithBodyForServer.bind(this)(httpMethod);
  },
);
