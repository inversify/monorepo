import { Given } from '@cucumber/cucumber';
import { Middleware } from '@inversifyjs/http-core';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteNextExpressController } from '../controllers/express/WarriorsDeleteNextExpressController.js';
import { WarriorsGetNextExpressController } from '../controllers/express/WarriorsGetNextExpressController.js';
import { WarriorsOptionsNextExpressController } from '../controllers/express/WarriorsOptionsNextExpressController.js';
import { WarriorsPatchNextExpressController } from '../controllers/express/WarriorsPatchNextExpressController.js';
import { WarriorsPostNextExpressController } from '../controllers/express/WarriorsPostNextExpressController.js';
import { WarriorsPutNextExpressController } from '../controllers/express/WarriorsPutNextExpressController.js';
import { WarriorsDeleteNextExpress4Controller } from '../controllers/express4/WarriorsDeleteNextExpress4Controller.js';
import { WarriorsGetNextExpress4Controller } from '../controllers/express4/WarriorsGetNextExpress4Controller.js';
import { WarriorsOptionsNextExpress4Controller } from '../controllers/express4/WarriorsOptionsNextExpress4Controller.js';
import { WarriorsPatchNextExpress4Controller } from '../controllers/express4/WarriorsPatchNextExpress4Controller.js';
import { WarriorsPostNextExpress4Controller } from '../controllers/express4/WarriorsPostNextExpress4Controller.js';
import { WarriorsPutNextExpress4Controller } from '../controllers/express4/WarriorsPutNextExpress4Controller.js';
import { WarriorsDeleteNextFastifyController } from '../controllers/fastify/WarriorsDeleteNextFastifyController.js';
import { WarriorsGetNextFastifyController } from '../controllers/fastify/WarriorsGetNextFastifyController.js';
import { WarriorsOptionsNextFastifyController } from '../controllers/fastify/WarriorsOptionsFastifyExpressController.js';
import { WarriorsPatchNextFastifyController } from '../controllers/fastify/WarriorsPatchNextFastifyController.js';
import { WarriorsPostNextFastifyController } from '../controllers/fastify/WarriorsPostNextFastifyController.js';
import { WarriorsPutNextFastifyController } from '../controllers/fastify/WarriorsPutNextFastifyController.js';
import { WarriorsDeleteNextHonoController } from '../controllers/hono/WarriorsDeleteNextHonoController.js';
import { WarriorsGetNextHonoController } from '../controllers/hono/WarriorsGetNextHonoController.js';
import { WarriorsOptionsNextHonoController } from '../controllers/hono/WarriorsOptionsNextHonoController.js';
import { WarriorsPatchNextHonoController } from '../controllers/hono/WarriorsPatchNextHonoController.js';
import { WarriorsPostNextHonoController } from '../controllers/hono/WarriorsPostNextHonoController.js';
import { WarriorsPutNextHonoController } from '../controllers/hono/WarriorsPutNextHonoController.js';
import { WarriorsDeleteNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsDeleteNextUwebSocketsController.js';
import { WarriorsGetNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsGetNextUwebSocketsController.js';
import { WarriorsOptionsNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsOptionsNextUwebSocketsController.js';
import { WarriorsPatchNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsPatchNextUwebSocketsController.js';
import { WarriorsPostNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsPostNextUwebSocketsController.js';
import { WarriorsPutNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsPutNextUwebSocketsController.js';
import { NextExpress4Middleware } from '../middlewares/NextExpress4Middleware.js';
import { NextExpressMiddleware } from '../middlewares/NextExpressMiddleware.js';
import { NextFastifyMiddleware } from '../middlewares/NextFastifyMiddleware.js';
import { NextHonoMiddleware } from '../middlewares/NextHonoMiddleware.js';
import { NextUwebSocketsMiddleware } from '../middlewares/NextUwebSocketsMiddleware.js';

function getWarriorNextController(
  method: HttpMethod,
  serverKind: ServerKind,
): Newable {
  switch (serverKind) {
    case ServerKind.express:
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteNextExpressController;
        case HttpMethod.get:
          return WarriorsGetNextExpressController;
        case HttpMethod.options:
          return WarriorsOptionsNextExpressController;
        case HttpMethod.patch:
          return WarriorsPatchNextExpressController;
        case HttpMethod.post:
          return WarriorsPostNextExpressController;
        case HttpMethod.put:
          return WarriorsPutNextExpressController;
      }

    // eslint-disable-next-line no-fallthrough
    case ServerKind.express4:
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteNextExpress4Controller;
        case HttpMethod.get:
          return WarriorsGetNextExpress4Controller;
        case HttpMethod.options:
          return WarriorsOptionsNextExpress4Controller;
        case HttpMethod.patch:
          return WarriorsPatchNextExpress4Controller;
        case HttpMethod.post:
          return WarriorsPostNextExpress4Controller;
        case HttpMethod.put:
          return WarriorsPutNextExpress4Controller;
      }

    // eslint-disable-next-line no-fallthrough
    case ServerKind.fastify:
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteNextFastifyController;
        case HttpMethod.get:
          return WarriorsGetNextFastifyController;
        case HttpMethod.options:
          return WarriorsOptionsNextFastifyController;
        case HttpMethod.patch:
          return WarriorsPatchNextFastifyController;
        case HttpMethod.post:
          return WarriorsPostNextFastifyController;
        case HttpMethod.put:
          return WarriorsPutNextFastifyController;
      }

    // eslint-disable-next-line no-fallthrough
    case ServerKind.hono:
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteNextHonoController;
        case HttpMethod.get:
          return WarriorsGetNextHonoController;
        case HttpMethod.options:
          return WarriorsOptionsNextHonoController;
        case HttpMethod.patch:
          return WarriorsPatchNextHonoController;
        case HttpMethod.post:
          return WarriorsPostNextHonoController;
        case HttpMethod.put:
          return WarriorsPutNextHonoController;
      }

    // eslint-disable-next-line no-fallthrough
    case ServerKind.uwebsockets:
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteNextUwebSocketsController;
        case HttpMethod.get:
          return WarriorsGetNextUwebSocketsController;
        case HttpMethod.options:
          return WarriorsOptionsNextUwebSocketsController;
        case HttpMethod.patch:
          return WarriorsPatchNextUwebSocketsController;
        case HttpMethod.post:
          return WarriorsPostNextUwebSocketsController;
        case HttpMethod.put:
          return WarriorsPutNextUwebSocketsController;
      }

    // eslint-disable-next-line no-fallthrough
    default:
      throw new Error(
        `getWarriorNextController not supported for ${serverKind as string} server`,
      );
  }
}

function getWarriorNextMiddleware(serverKind: ServerKind): Newable<Middleware> {
  switch (serverKind) {
    case ServerKind.express:
      return NextExpressMiddleware;
    case ServerKind.express4:
      return NextExpress4Middleware;
    case ServerKind.fastify:
      return NextFastifyMiddleware;
    case ServerKind.hono:
      return NextHonoMiddleware;
    case ServerKind.uwebsockets:
      return NextUwebSocketsMiddleware;
  }
}

function givenWarriorNextControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getWarriorNextController(method, serverKind);
  const middleware: Newable<Middleware> | undefined =
    getWarriorNextMiddleware(serverKind);

  container.bind(controller).toSelf().inSingletonScope();
  container.bind(middleware).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with next decorator for "{httpMethod}" method for "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorNextControllerForContainer.bind(this)(httpMethod, serverKind);
  },
);
