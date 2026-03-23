import { Given } from '@cucumber/cucumber';
import { Middleware } from '@inversifyjs/http-core';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteRouteValueMetadataExpressController } from '../controllers/express/WarriorsDeleteRouteValueMetadataExpressController';
import { WarriorsGetRouteValueMetadataExpressController } from '../controllers/express/WarriorsGetRouteValueMetadataExpressController';
import { WarriorsOptionsRouteValueMetadataExpressController } from '../controllers/express/WarriorsOptionsRouteValueMetadataExpressController';
import { WarriorsPatchRouteValueMetadataExpressController } from '../controllers/express/WarriorsPatchRouteValueMetadataExpressController';
import { WarriorsPostRouteValueMetadataExpressController } from '../controllers/express/WarriorsPostRouteValueMetadataExpressController';
import { WarriorsPutRouteValueMetadataExpressController } from '../controllers/express/WarriorsPutRouteValueMetadataExpressController';
import { WarriorsDeleteRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsDeleteRouteValueMetadataExpressV4Controller';
import { WarriorsGetRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsGetRouteValueMetadataExpressV4Controller';
import { WarriorsOptionsRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsOptionsRouteValueMetadataExpressV4Controller';
import { WarriorsPatchRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsPatchRouteValueMetadataExpressV4Controller';
import { WarriorsPostRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsPostRouteValueMetadataExpressV4Controller';
import { WarriorsPutRouteValueMetadataExpressV4Controller } from '../controllers/express4/WarriorsPutRouteValueMetadataExpressV4Controller';
import { WarriorsDeleteRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsDeleteRouteValueMetadataFastifyController';
import { WarriorsGetRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsGetRouteValueMetadataFastifyController';
import { WarriorsOptionsRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsOptionsRouteValueMetadataFastifyController';
import { WarriorsPatchRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsPatchRouteValueMetadataFastifyController';
import { WarriorsPostRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsPostRouteValueMetadataFastifyController';
import { WarriorsPutRouteValueMetadataFastifyController } from '../controllers/fastify/WarriorsPutRouteValueMetadataFastifyController';
import { WarriorsDeleteRouteValueMetadataHonoController } from '../controllers/hono/WarriorsDeleteRouteValueMetadataHonoController';
import { WarriorsGetRouteValueMetadataHonoController } from '../controllers/hono/WarriorsGetRouteValueMetadataHonoController';
import { WarriorsOptionsRouteValueMetadataHonoController } from '../controllers/hono/WarriorsOptionsRouteValueMetadataHonoController';
import { WarriorsPatchRouteValueMetadataHonoController } from '../controllers/hono/WarriorsPatchRouteValueMetadataHonoController';
import { WarriorsPostRouteValueMetadataHonoController } from '../controllers/hono/WarriorsPostRouteValueMetadataHonoController';
import { WarriorsPutRouteValueMetadataHonoController } from '../controllers/hono/WarriorsPutRouteValueMetadataHonoController';
import { WarriorsDeleteRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsDeleteRouteValueMetadataUwebSocketsController';
import { WarriorsGetRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsGetRouteValueMetadataUwebSocketsController';
import { WarriorsOptionsRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsOptionsRouteValueMetadataUwebSocketsController';
import { WarriorsPatchRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsPatchRouteValueMetadataUwebSocketsController';
import { WarriorsPostRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsPostRouteValueMetadataUwebSocketsController';
import { WarriorsPutRouteValueMetadataUwebSocketsController } from '../controllers/uwebsockets/WarriorsPutRouteValueMetadataUwebSocketsController';
import { RouteValueMetadataExpressMiddleware } from '../middlewares/express/RouteValueMetadataExpressMiddleware';
import { RouteValueMetadataExpressV4Middleware } from '../middlewares/express4/RouteValueMetadataExpressV4Middleware';
import { RouteValueMetadataFastifyMiddleware } from '../middlewares/fastify/RouteValueMetadataFastifyMiddleware';
import { RouteValueMetadataHonoMiddleware } from '../middlewares/hono/RouteValueMetadataHonoMiddleware';
import { RouteValueMetadataUwebSocketsMiddleware } from '../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware';

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
