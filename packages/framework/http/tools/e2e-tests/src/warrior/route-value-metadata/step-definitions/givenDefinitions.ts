import { Given } from '@cucumber/cucumber';
import { Middleware } from '@inversifyjs/http-core';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteRouteValueMetadataExpressController } from '../controllers/express/WarriorsDeleteRouteValueMetadataExpressController.js';
import { WarriorsGetRouteValueMetadataExpressController } from '../controllers/express/WarriorsGetRouteValueMetadataExpressController.js';
import { WarriorsOptionsRouteValueMetadataExpressController } from '../controllers/express/WarriorsOptionsRouteValueMetadataExpressController.js';
import { WarriorsPatchRouteValueMetadataExpressController } from '../controllers/express/WarriorsPatchRouteValueMetadataExpressController.js';
import { WarriorsPostRouteValueMetadataExpressController } from '../controllers/express/WarriorsPostRouteValueMetadataExpressController.js';
import { WarriorsPutRouteValueMetadataExpressController } from '../controllers/express/WarriorsPutRouteValueMetadataExpressController.js';
import { WarriorsDeleteRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsDeleteRouteValueMetadataExpressV4Controller.js';
import { WarriorsGetRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsGetRouteValueMetadataExpressV4Controller.js';
import { WarriorsOptionsRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsOptionsRouteValueMetadataExpressV4Controller.js';
import { WarriorsPatchRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsPatchRouteValueMetadataExpressV4Controller.js';
import { WarriorsPostRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsPostRouteValueMetadataExpressV4Controller.js';
import { WarriorsPutRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsPutRouteValueMetadataExpressV4Controller.js';
import { WarriorsDeleteRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsDeleteRouteValueMetadataFastifyController.js';
import { WarriorsGetRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsGetRouteValueMetadataFastifyController.js';
import { WarriorsOptionsRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsOptionsRouteValueMetadataFastifyController.js';
import { WarriorsPatchRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsPatchRouteValueMetadataFastifyController.js';
import { WarriorsPostRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsPostRouteValueMetadataFastifyController.js';
import { WarriorsPutRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsPutRouteValueMetadataFastifyController.js';
import { WarriorsDeleteRouteValueMetadataHonoController } from '../controllers/hono/WarriorsDeleteRouteValueMetadataHonoController.js';
import { WarriorsGetRouteValueMetadataHonoController } from '../controllers/hono/WarriorsGetRouteValueMetadataHonoController.js';
import { WarriorsOptionsRouteValueMetadataHonoController } from '../controllers/hono/WarriorsOptionsRouteValueMetadataHonoController.js';
import { WarriorsPatchRouteValueMetadataHonoController } from '../controllers/hono/WarriorsPatchRouteValueMetadataHonoController.js';
import { WarriorsPostRouteValueMetadataHonoController } from '../controllers/hono/WarriorsPostRouteValueMetadataHonoController.js';
import { WarriorsPutRouteValueMetadataHonoController } from '../controllers/hono/WarriorsPutRouteValueMetadataHonoController.js';
import { WarriorsDeleteRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsDeleteRouteValueMetadataUwebSocketsController.js';
import { WarriorsGetRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsGetRouteValueMetadataUwebSocketsController.js';
import { WarriorsOptionsRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsOptionsRouteValueMetadataUwebSocketsController.js';
import { WarriorsPatchRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsPatchRouteValueMetadataUwebSocketsController.js';
import { WarriorsPostRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsPostRouteValueMetadataUwebSocketsController.js';
import { WarriorsPutRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsPutRouteValueMetadataUwebSocketsController.js';
import { RouteValueMetadataExpressMiddleware } from '../middlewares/express/RouteValueMetadataExpressMiddleware.js';
import { RouteValueMetadataExpressV4Middleware } from '../middlewares/express4/RouteValueMetadataExpressV4Middleware.js';
import { RouteValueMetadataFastifyMiddleware } from '../middlewares/fastify/RouteValueMetadataFastifyMiddleware.js';
import { RouteValueMetadataHonoMiddleware } from '../middlewares/hono/RouteValueMetadataHonoMiddleware.js';
import { RouteValueMetadataUwebSocketsMiddleware } from '../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware.js';

function getMethodWarriorRouteValueMetadataExpressController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRouteValueMetadataExpressController;
    case HttpMethod.get:
      return WarriorsGetRouteValueMetadataExpressController;
    case HttpMethod.options:
      return WarriorsOptionsRouteValueMetadataExpressController;
    case HttpMethod.patch:
      return WarriorsPatchRouteValueMetadataExpressController;
    case HttpMethod.post:
      return WarriorsPostRouteValueMetadataExpressController;
    case HttpMethod.put:
      return WarriorsPutRouteValueMetadataExpressController;
  }
}

function getMethodWarriorRouteValueMetadataExpressV4Controller(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRouteValueMetadataExpressV4Controller;
    case HttpMethod.get:
      return WarriorsGetRouteValueMetadataExpressV4Controller;
    case HttpMethod.options:
      return WarriorsOptionsRouteValueMetadataExpressV4Controller;
    case HttpMethod.patch:
      return WarriorsPatchRouteValueMetadataExpressV4Controller;
    case HttpMethod.post:
      return WarriorsPostRouteValueMetadataExpressV4Controller;
    case HttpMethod.put:
      return WarriorsPutRouteValueMetadataExpressV4Controller;
  }
}

function getMethodWarriorRouteValueMetadataFastifyController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRouteValueMetadataFastifyController;
    case HttpMethod.get:
      return WarriorsGetRouteValueMetadataFastifyController;
    case HttpMethod.options:
      return WarriorsOptionsRouteValueMetadataFastifyController;
    case HttpMethod.patch:
      return WarriorsPatchRouteValueMetadataFastifyController;
    case HttpMethod.post:
      return WarriorsPostRouteValueMetadataFastifyController;
    case HttpMethod.put:
      return WarriorsPutRouteValueMetadataFastifyController;
  }
}

function getMethodWarriorRouteValueMetadataHonoController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRouteValueMetadataHonoController;
    case HttpMethod.get:
      return WarriorsGetRouteValueMetadataHonoController;
    case HttpMethod.options:
      return WarriorsOptionsRouteValueMetadataHonoController;
    case HttpMethod.patch:
      return WarriorsPatchRouteValueMetadataHonoController;
    case HttpMethod.post:
      return WarriorsPostRouteValueMetadataHonoController;
    case HttpMethod.put:
      return WarriorsPutRouteValueMetadataHonoController;
  }
}

function getMethodWarriorRouteValueMetadataUwebSocketsController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteRouteValueMetadataUwebSocketsController;
    case HttpMethod.get:
      return WarriorsGetRouteValueMetadataUwebSocketsController;
    case HttpMethod.options:
      return WarriorsOptionsRouteValueMetadataUwebSocketsController;
    case HttpMethod.patch:
      return WarriorsPatchRouteValueMetadataUwebSocketsController;
    case HttpMethod.post:
      return WarriorsPostRouteValueMetadataUwebSocketsController;
    case HttpMethod.put:
      return WarriorsPutRouteValueMetadataUwebSocketsController;
  }
}

function givenWarriorRouteValueMetadataControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorController: (method: HttpMethod) => Newable;
  let middleware: Newable<Middleware>;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorController =
        getMethodWarriorRouteValueMetadataExpressController;
      middleware = RouteValueMetadataExpressMiddleware;
      break;
    case ServerKind.express4:
      getMethodWarriorController =
        getMethodWarriorRouteValueMetadataExpressV4Controller;
      middleware = RouteValueMetadataExpressV4Middleware;
      break;
    case ServerKind.fastify:
      getMethodWarriorController =
        getMethodWarriorRouteValueMetadataFastifyController;
      middleware = RouteValueMetadataFastifyMiddleware;
      break;
    case ServerKind.hono:
      getMethodWarriorController =
        getMethodWarriorRouteValueMetadataHonoController;
      middleware = RouteValueMetadataHonoMiddleware;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorController =
        getMethodWarriorRouteValueMetadataUwebSocketsController;
      middleware = RouteValueMetadataUwebSocketsMiddleware;
      break;
  }

  const controller: Newable = getMethodWarriorController(method);

  container.bind(middleware).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with RouteValueMetadata for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorRouteValueMetadataControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);
