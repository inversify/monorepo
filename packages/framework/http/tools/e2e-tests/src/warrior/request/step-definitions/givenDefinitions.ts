import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteRequestExpressController } from '../controllers/WarriorsDeleteRequestExpressController';
import { WarriorsDeleteRequestExpressV4Controller } from '../controllers/WarriorsDeleteRequestExpressV4Controller';
import { WarriorsDeleteRequestFastifyController } from '../controllers/WarriorsDeleteRequestFastifyController';
import { WarriorsDeleteRequestHonoController } from '../controllers/WarriorsDeleteRequestHonoController';
import { WarriorsDeleteRequestUwebSocketsController } from '../controllers/WarriorsDeleteRequestUwebSocketsController';
import { WarriorsGetRequestExpressController } from '../controllers/WarriorsGetRequestExpressController';
import { WarriorsGetRequestExpressV4Controller } from '../controllers/WarriorsGetRequestExpressV4Controller';
import { WarriorsGetRequestFastifyController } from '../controllers/WarriorsGetRequestFastifyController';
import { WarriorsGetRequestHonoController } from '../controllers/WarriorsGetRequestHonoController';
import { WarriorsGetRequestUwebSocketsController } from '../controllers/WarriorsGetRequestUwebSocketsController';
import { WarriorsOptionsRequestExpressController } from '../controllers/WarriorsOptionsRequestExpressController';
import { WarriorsOptionsRequestExpressV4Controller } from '../controllers/WarriorsOptionsRequestExpressV4Controller';
import { WarriorsOptionsRequestFastifyController } from '../controllers/WarriorsOptionsRequestFastifyController';
import { WarriorsOptionsRequestHonoController } from '../controllers/WarriorsOptionsRequestHonoController';
import { WarriorsOptionsRequestUwebSocketsController } from '../controllers/WarriorsOptionsRequestUwebSocketsController';
import { WarriorsPatchRequestExpressController } from '../controllers/WarriorsPatchRequestExpressController';
import { WarriorsPatchRequestExpressV4Controller } from '../controllers/WarriorsPatchRequestExpressV4Controller';
import { WarriorsPatchRequestFastifyController } from '../controllers/WarriorsPatchRequestFastifyController';
import { WarriorsPatchRequestHonoController } from '../controllers/WarriorsPatchRequestHonoController';
import { WarriorsPatchRequestUwebSocketsController } from '../controllers/WarriorsPatchRequestUwebSocketsController';
import { WarriorsPostRequestExpressController } from '../controllers/WarriorsPostRequestExpressController';
import { WarriorsPostRequestExpressV4Controller } from '../controllers/WarriorsPostRequestExpressV4Controller';
import { WarriorsPostRequestFastifyController } from '../controllers/WarriorsPostRequestFastifyController';
import { WarriorsPostRequestHonoController } from '../controllers/WarriorsPostRequestHonoController';
import { WarriorsPostRequestUwebSocketsController } from '../controllers/WarriorsPostRequestUwebSocketsController';
import { WarriorsPutRequestExpressController } from '../controllers/WarriorsPutRequestExpressController';
import { WarriorsPutRequestExpressV4Controller } from '../controllers/WarriorsPutRequestExpressV4Controller';
import { WarriorsPutRequestFastifyController } from '../controllers/WarriorsPutRequestFastifyController';
import { WarriorsPutRequestHonoController } from '../controllers/WarriorsPutRequestHonoController';
import { WarriorsPutRequestUwebSocketsController } from '../controllers/WarriorsPutRequestUwebSocketsController';

function getMethodWarriorRequestExpressController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRequestExpressController;
    case HttpMethod.get:
      return WarriorsGetRequestExpressController;
    case HttpMethod.options:
      return WarriorsOptionsRequestExpressController;
    case HttpMethod.patch:
      return WarriorsPatchRequestExpressController;
    case HttpMethod.post:
      return WarriorsPostRequestExpressController;
    case HttpMethod.put:
      return WarriorsPutRequestExpressController;
  }
}

function getMethodWarriorRequestExpressV4Controller(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRequestExpressV4Controller;
    case HttpMethod.get:
      return WarriorsGetRequestExpressV4Controller;
    case HttpMethod.options:
      return WarriorsOptionsRequestExpressV4Controller;
    case HttpMethod.patch:
      return WarriorsPatchRequestExpressV4Controller;
    case HttpMethod.post:
      return WarriorsPostRequestExpressV4Controller;
    case HttpMethod.put:
      return WarriorsPutRequestExpressV4Controller;
  }
}

function getMethodWarriorRequestFastifyController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRequestFastifyController;
    case HttpMethod.get:
      return WarriorsGetRequestFastifyController;
    case HttpMethod.options:
      return WarriorsOptionsRequestFastifyController;
    case HttpMethod.patch:
      return WarriorsPatchRequestFastifyController;
    case HttpMethod.post:
      return WarriorsPostRequestFastifyController;
    case HttpMethod.put:
      return WarriorsPutRequestFastifyController;
  }
}

function getMethodWarriorRequestHonoController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRequestHonoController;
    case HttpMethod.get:
      return WarriorsGetRequestHonoController;
    case HttpMethod.options:
      return WarriorsOptionsRequestHonoController;
    case HttpMethod.patch:
      return WarriorsPatchRequestHonoController;
    case HttpMethod.post:
      return WarriorsPostRequestHonoController;
    case HttpMethod.put:
      return WarriorsPutRequestHonoController;
  }
}

function getMethodWarriorRequestUwebSocketsController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRequestUwebSocketsController;
    case HttpMethod.get:
      return WarriorsGetRequestUwebSocketsController;
    case HttpMethod.options:
      return WarriorsOptionsRequestUwebSocketsController;
    case HttpMethod.patch:
      return WarriorsPatchRequestUwebSocketsController;
    case HttpMethod.post:
      return WarriorsPostRequestUwebSocketsController;
    case HttpMethod.put:
      return WarriorsPutRequestUwebSocketsController;
  }
}

function givenWarriorRequestControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorRequestController: (
    method: HttpMethod,
  ) => NewableFunction;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorRequestController =
        getMethodWarriorRequestExpressController;
      break;
    case ServerKind.express4:
      getMethodWarriorRequestController =
        getMethodWarriorRequestExpressV4Controller;
      break;
    case ServerKind.fastify:
      getMethodWarriorRequestController =
        getMethodWarriorRequestFastifyController;
      break;
    case ServerKind.hono:
      getMethodWarriorRequestController = getMethodWarriorRequestHonoController;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorRequestController =
        getMethodWarriorRequestUwebSocketsController;
      break;
  }

  const controller: NewableFunction = getMethodWarriorRequestController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with request decorator for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorRequestControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);
