import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteResponseExpressController } from '../controllers/WarriorsDeleteResponseExpressController.js';
import { WarriorsDeleteResponseExpressV4Controller } from '../controllers/WarriorsDeleteResponseExpressV4Controller.js';
import { WarriorsDeleteResponseFastifyController } from '../controllers/WarriorsDeleteResponseFastifyController.js';
import { WarriorsDeleteResponseHonoController } from '../controllers/WarriorsDeleteResponseHonoController.js';
import { WarriorsDeleteResponseUwebSocketsController } from '../controllers/WarriorsDeleteResponseUwebSocketsController.js';
import { WarriorsGetResponseExpressController } from '../controllers/WarriorsGetResponseExpressController.js';
import { WarriorsGetResponseExpressV4Controller } from '../controllers/WarriorsGetResponseExpressV4Controller.js';
import { WarriorsGetResponseFastifyController } from '../controllers/WarriorsGetResponseFastifyController.js';
import { WarriorsGetResponseHonoController } from '../controllers/WarriorsGetResponseHonoController.js';
import { WarriorsGetResponseUwebSocketsController } from '../controllers/WarriorsGetResponseUwebSocketsController.js';
import { WarriorsOptionsResponseExpressController } from '../controllers/WarriorsOptionsResponseExpressController.js';
import { WarriorsOptionsResponseExpressV4Controller } from '../controllers/WarriorsOptionsResponseExpressV4Controller.js';
import { WarriorsOptionsResponseFastifyController } from '../controllers/WarriorsOptionsResponseFastifyController.js';
import { WarriorsOptionsResponseHonoController } from '../controllers/WarriorsOptionsResponseHonoController.js';
import { WarriorsOptionsResponseUwebSocketsController } from '../controllers/WarriorsOptionsResponseUwebSocketsController.js';
import { WarriorsPatchResponseExpressController } from '../controllers/WarriorsPatchResponseExpressController.js';
import { WarriorsPatchResponseExpressV4Controller } from '../controllers/WarriorsPatchResponseExpressV4Controller.js';
import { WarriorsPatchResponseFastifyController } from '../controllers/WarriorsPatchResponseFastifyController.js';
import { WarriorsPatchResponseHonoController } from '../controllers/WarriorsPatchResponseHonoController.js';
import { WarriorsPatchResponseUwebSocketsController } from '../controllers/WarriorsPatchResponseUwebSocketsController.js';
import { WarriorsPostResponseExpressController } from '../controllers/WarriorsPostResponseExpressController.js';
import { WarriorsPostResponseExpressV4Controller } from '../controllers/WarriorsPostResponseExpressV4Controller.js';
import { WarriorsPostResponseFastifyController } from '../controllers/WarriorsPostResponseFastifyController.js';
import { WarriorsPostResponseHonoController } from '../controllers/WarriorsPostResponseHonoController.js';
import { WarriorsPostResponseUwebSocketsController } from '../controllers/WarriorsPostResponseUwebSocketsController.js';
import { WarriorsPutResponseExpressController } from '../controllers/WarriorsPutResponseExpressController.js';
import { WarriorsPutResponseExpressV4Controller } from '../controllers/WarriorsPutResponseExpressV4Controller.js';
import { WarriorsPutResponseFastifyController } from '../controllers/WarriorsPutResponseFastifyController.js';
import { WarriorsPutResponseHonoController } from '../controllers/WarriorsPutResponseHonoController.js';
import { WarriorsPutResponseUwebSocketsController } from '../controllers/WarriorsPutResponseUwebSocketsController.js';

function getMethodWarriorResponseExpressController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteResponseExpressController;
    case HttpMethod.get:
      return WarriorsGetResponseExpressController;
    case HttpMethod.options:
      return WarriorsOptionsResponseExpressController;
    case HttpMethod.patch:
      return WarriorsPatchResponseExpressController;
    case HttpMethod.post:
      return WarriorsPostResponseExpressController;
    case HttpMethod.put:
      return WarriorsPutResponseExpressController;
  }
}

function getMethodWarriorResponseExpressV4Controller(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteResponseExpressV4Controller;
    case HttpMethod.get:
      return WarriorsGetResponseExpressV4Controller;
    case HttpMethod.options:
      return WarriorsOptionsResponseExpressV4Controller;
    case HttpMethod.patch:
      return WarriorsPatchResponseExpressV4Controller;
    case HttpMethod.post:
      return WarriorsPostResponseExpressV4Controller;
    case HttpMethod.put:
      return WarriorsPutResponseExpressV4Controller;
  }
}

function getMethodWarriorResponseFastifyController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteResponseFastifyController;
    case HttpMethod.get:
      return WarriorsGetResponseFastifyController;
    case HttpMethod.options:
      return WarriorsOptionsResponseFastifyController;
    case HttpMethod.patch:
      return WarriorsPatchResponseFastifyController;
    case HttpMethod.post:
      return WarriorsPostResponseFastifyController;
    case HttpMethod.put:
      return WarriorsPutResponseFastifyController;
  }
}

function getMethodWarriorResponseHonoController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteResponseHonoController;
    case HttpMethod.get:
      return WarriorsGetResponseHonoController;
    case HttpMethod.options:
      return WarriorsOptionsResponseHonoController;
    case HttpMethod.patch:
      return WarriorsPatchResponseHonoController;
    case HttpMethod.post:
      return WarriorsPostResponseHonoController;
    case HttpMethod.put:
      return WarriorsPutResponseHonoController;
  }
}

function getMethodWarriorResponseUwebSocketsController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteResponseUwebSocketsController;
    case HttpMethod.get:
      return WarriorsGetResponseUwebSocketsController;
    case HttpMethod.options:
      return WarriorsOptionsResponseUwebSocketsController;
    case HttpMethod.patch:
      return WarriorsPatchResponseUwebSocketsController;
    case HttpMethod.post:
      return WarriorsPostResponseUwebSocketsController;
    case HttpMethod.put:
      return WarriorsPutResponseUwebSocketsController;
  }
}

function givenWarriorResponseControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorResponseController: (method: HttpMethod) => Newable;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorResponseController =
        getMethodWarriorResponseExpressController;
      break;
    case ServerKind.express4:
      getMethodWarriorResponseController =
        getMethodWarriorResponseExpressV4Controller;
      break;
    case ServerKind.fastify:
      getMethodWarriorResponseController =
        getMethodWarriorResponseFastifyController;
      break;
    case ServerKind.hono:
      getMethodWarriorResponseController =
        getMethodWarriorResponseHonoController;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorResponseController =
        getMethodWarriorResponseUwebSocketsController;
      break;
  }

  const controller: Newable = getMethodWarriorResponseController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with response decorator for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorResponseControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);
