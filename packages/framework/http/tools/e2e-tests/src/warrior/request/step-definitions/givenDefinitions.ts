import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteRequestExpressController } from '../controllers/WarriorsDeleteRequestExpressController.js';
import { WarriorsDeleteRequestExpressV4Controller } from '../controllers/WarriorsDeleteRequestExpressV4Controller.js';
import { WarriorsDeleteRequestFastifyController } from '../controllers/WarriorsDeleteRequestFastifyController.js';
import { WarriorsDeleteRequestHonoController } from '../controllers/WarriorsDeleteRequestHonoController.js';
import { WarriorsDeleteRequestUwebSocketsController } from '../controllers/WarriorsDeleteRequestUwebSocketsController.js';
import { WarriorsGetRequestExpressController } from '../controllers/WarriorsGetRequestExpressController.js';
import { WarriorsGetRequestExpressV4Controller } from '../controllers/WarriorsGetRequestExpressV4Controller.js';
import { WarriorsGetRequestFastifyController } from '../controllers/WarriorsGetRequestFastifyController.js';
import { WarriorsGetRequestHonoController } from '../controllers/WarriorsGetRequestHonoController.js';
import { WarriorsGetRequestUwebSocketsController } from '../controllers/WarriorsGetRequestUwebSocketsController.js';
import { WarriorsOptionsRequestExpressController } from '../controllers/WarriorsOptionsRequestExpressController.js';
import { WarriorsOptionsRequestExpressV4Controller } from '../controllers/WarriorsOptionsRequestExpressV4Controller.js';
import { WarriorsOptionsRequestFastifyController } from '../controllers/WarriorsOptionsRequestFastifyController.js';
import { WarriorsOptionsRequestHonoController } from '../controllers/WarriorsOptionsRequestHonoController.js';
import { WarriorsOptionsRequestUwebSocketsController } from '../controllers/WarriorsOptionsRequestUwebSocketsController.js';
import { WarriorsPatchRequestExpressController } from '../controllers/WarriorsPatchRequestExpressController.js';
import { WarriorsPatchRequestExpressV4Controller } from '../controllers/WarriorsPatchRequestExpressV4Controller.js';
import { WarriorsPatchRequestFastifyController } from '../controllers/WarriorsPatchRequestFastifyController.js';
import { WarriorsPatchRequestHonoController } from '../controllers/WarriorsPatchRequestHonoController.js';
import { WarriorsPatchRequestUwebSocketsController } from '../controllers/WarriorsPatchRequestUwebSocketsController.js';
import { WarriorsPostRequestExpressController } from '../controllers/WarriorsPostRequestExpressController.js';
import { WarriorsPostRequestExpressV4Controller } from '../controllers/WarriorsPostRequestExpressV4Controller.js';
import { WarriorsPostRequestFastifyController } from '../controllers/WarriorsPostRequestFastifyController.js';
import { WarriorsPostRequestHonoController } from '../controllers/WarriorsPostRequestHonoController.js';
import { WarriorsPostRequestUwebSocketsController } from '../controllers/WarriorsPostRequestUwebSocketsController.js';
import { WarriorsPutRequestExpressController } from '../controllers/WarriorsPutRequestExpressController.js';
import { WarriorsPutRequestExpressV4Controller } from '../controllers/WarriorsPutRequestExpressV4Controller.js';
import { WarriorsPutRequestFastifyController } from '../controllers/WarriorsPutRequestFastifyController.js';
import { WarriorsPutRequestHonoController } from '../controllers/WarriorsPutRequestHonoController.js';
import { WarriorsPutRequestUwebSocketsController } from '../controllers/WarriorsPutRequestUwebSocketsController.js';

function getMethodWarriorRequestExpressController(method: HttpMethod): Newable {
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
): Newable {
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

function getMethodWarriorRequestFastifyController(method: HttpMethod): Newable {
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

function getMethodWarriorRequestHonoController(method: HttpMethod): Newable {
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
): Newable {
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

  let getMethodWarriorRequestController: (method: HttpMethod) => Newable;

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

  const controller: Newable = getMethodWarriorRequestController(method);

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
