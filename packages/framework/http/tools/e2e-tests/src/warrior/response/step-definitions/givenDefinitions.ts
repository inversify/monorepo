import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteResponseExpressController } from '../controllers/WarriorsDeleteResponseExpressController';
import { WarriorsDeleteResponseExpressV4Controller } from '../controllers/WarriorsDeleteResponseExpressV4Controller';
import { WarriorsDeleteResponseFastifyController } from '../controllers/WarriorsDeleteResponseFastifyController';
import { WarriorsDeleteResponseHonoController } from '../controllers/WarriorsDeleteResponseHonoController';
import { WarriorsDeleteResponseUwebSocketsController } from '../controllers/WarriorsDeleteResponseUwebSocketsController';
import { WarriorsGetResponseExpressController } from '../controllers/WarriorsGetResponseExpressController';
import { WarriorsGetResponseExpressV4Controller } from '../controllers/WarriorsGetResponseExpressV4Controller';
import { WarriorsGetResponseFastifyController } from '../controllers/WarriorsGetResponseFastifyController';
import { WarriorsGetResponseHonoController } from '../controllers/WarriorsGetResponseHonoController';
import { WarriorsGetResponseUwebSocketsController } from '../controllers/WarriorsGetResponseUwebSocketsController';
import { WarriorsOptionsResponseExpressController } from '../controllers/WarriorsOptionsResponseExpressController';
import { WarriorsOptionsResponseExpressV4Controller } from '../controllers/WarriorsOptionsResponseExpressV4Controller';
import { WarriorsOptionsResponseFastifyController } from '../controllers/WarriorsOptionsResponseFastifyController';
import { WarriorsOptionsResponseHonoController } from '../controllers/WarriorsOptionsResponseHonoController';
import { WarriorsOptionsResponseUwebSocketsController } from '../controllers/WarriorsOptionsResponseUwebSocketsController';
import { WarriorsPatchResponseExpressController } from '../controllers/WarriorsPatchResponseExpressController';
import { WarriorsPatchResponseExpressV4Controller } from '../controllers/WarriorsPatchResponseExpressV4Controller';
import { WarriorsPatchResponseFastifyController } from '../controllers/WarriorsPatchResponseFastifyController';
import { WarriorsPatchResponseHonoController } from '../controllers/WarriorsPatchResponseHonoController';
import { WarriorsPatchResponseUwebSocketsController } from '../controllers/WarriorsPatchResponseUwebSocketsController';
import { WarriorsPostResponseExpressController } from '../controllers/WarriorsPostResponseExpressController';
import { WarriorsPostResponseExpressV4Controller } from '../controllers/WarriorsPostResponseExpressV4Controller';
import { WarriorsPostResponseFastifyController } from '../controllers/WarriorsPostResponseFastifyController';
import { WarriorsPostResponseHonoController } from '../controllers/WarriorsPostResponseHonoController';
import { WarriorsPostResponseUwebSocketsController } from '../controllers/WarriorsPostResponseUwebSocketsController';
import { WarriorsPutResponseExpressController } from '../controllers/WarriorsPutResponseExpressController';
import { WarriorsPutResponseExpressV4Controller } from '../controllers/WarriorsPutResponseExpressV4Controller';
import { WarriorsPutResponseFastifyController } from '../controllers/WarriorsPutResponseFastifyController';
import { WarriorsPutResponseHonoController } from '../controllers/WarriorsPutResponseHonoController';
import { WarriorsPutResponseUwebSocketsController } from '../controllers/WarriorsPutResponseUwebSocketsController';

function getMethodWarriorResponseExpressController(
  method: HttpMethod,
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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

function getMethodWarriorResponseHonoController(
  method: HttpMethod,
): NewableFunction {
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
): NewableFunction {
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

  let getMethodWarriorResponseController: (
    method: HttpMethod,
  ) => NewableFunction;

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

  const controller: NewableFunction =
    getMethodWarriorResponseController(method);

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
