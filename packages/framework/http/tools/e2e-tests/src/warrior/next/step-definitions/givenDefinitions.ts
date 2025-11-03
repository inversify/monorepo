import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteNextExpressController } from '../controllers/express/WarriorsDeleteNextExpressController';
import { WarriorsGetNextExpressController } from '../controllers/express/WarriorsGetNextExpressController';
import { WarriorsOptionsNextExpressController } from '../controllers/express/WarriorsOptionsNextExpressController';
import { WarriorsPatchNextExpressController } from '../controllers/express/WarriorsPatchNextExpressController';
import { WarriorsPostNextExpressController } from '../controllers/express/WarriorsPostNextExpressController';
import { WarriorsPutNextExpressController } from '../controllers/express/WarriorsPutNextExpressController';
import { WarriorsDeleteNextExpress4Controller } from '../controllers/express4/WarriorsDeleteNextExpress4Controller';
import { WarriorsGetNextExpress4Controller } from '../controllers/express4/WarriorsGetNextExpress4Controller';
import { WarriorsOptionsNextExpress4Controller } from '../controllers/express4/WarriorsOptionsNextExpress4Controller';
import { WarriorsPatchNextExpress4Controller } from '../controllers/express4/WarriorsPatchNextExpress4Controller';
import { WarriorsPostNextExpress4Controller } from '../controllers/express4/WarriorsPostNextExpress4Controller';
import { WarriorsPutNextExpress4Controller } from '../controllers/express4/WarriorsPutNextExpress4Controller';
import { WarriorsDeleteNextFastifyController } from '../controllers/fastify/WarriorsDeleteNextFastifyController';
import { WarriorsGetNextFastifyController } from '../controllers/fastify/WarriorsGetNextFastifyController';
import { WarriorsOptionsNextFastifyController } from '../controllers/fastify/WarriorsOptionsFastifyExpressController';
import { WarriorsPatchNextFastifyController } from '../controllers/fastify/WarriorsPatchNextFastifyController';
import { WarriorsPostNextFastifyController } from '../controllers/fastify/WarriorsPostNextFastifyController';
import { WarriorsPutNextFastifyController } from '../controllers/fastify/WarriorsPutNextFastifyController';
import { WarriorsDeleteNextHonoController } from '../controllers/hono/WarriorsDeleteNextHonoController';
import { WarriorsGetNextHonoController } from '../controllers/hono/WarriorsGetNextHonoController';
import { WarriorsOptionsNextHonoController } from '../controllers/hono/WarriorsOptionsNextHonoController';
import { WarriorsPatchNextHonoController } from '../controllers/hono/WarriorsPatchNextHonoController';
import { WarriorsPostNextHonoController } from '../controllers/hono/WarriorsPostNextHonoController';
import { WarriorsPutNextHonoController } from '../controllers/hono/WarriorsPutNextHonoController';
import { WarriorsDeleteNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsDeleteNextUwebSocketsController';
import { WarriorsGetNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsGetNextUwebSocketsController';
import { WarriorsOptionsNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsOptionsNextUwebSocketsController';
import { WarriorsPatchNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsPatchNextUwebSocketsController';
import { WarriorsPostNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsPostNextUwebSocketsController';
import { WarriorsPutNextUwebSocketsController } from '../controllers/uwebsockets/WarriorsPutNextUwebSocketsController';
import { NextExpress4Middleware } from '../middlewares/NextExpress4Middleware';
import { NextExpressMiddleware } from '../middlewares/NextExpressMiddleware';
import { NextFastifyMiddleware } from '../middlewares/NextFastifyMiddleware';
import { NextHonoMiddleware } from '../middlewares/NextHonoMiddleware';
import { NextUwebSocketsMiddleware } from '../middlewares/NextUwebSocketsMiddleware';

function getWarriorNextController(
  method: HttpMethod,
  serverKind: ServerKind,
): NewableFunction {
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

function getWarriorNextMiddleware(serverKind: ServerKind): NewableFunction {
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

  const controller: NewableFunction = getWarriorNextController(
    method,
    serverKind,
  );
  const middleware: NewableFunction | undefined =
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
