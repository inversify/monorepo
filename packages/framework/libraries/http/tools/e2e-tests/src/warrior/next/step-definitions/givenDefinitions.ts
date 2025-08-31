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
import { WarriorsDeleteNextHonoController } from '../controllers/hono/WarriorsDeleteNextHonoController';
import { WarriorsGetNextHonoController } from '../controllers/hono/WarriorsGetNextHonoController';
import { WarriorsOptionsNextHonoController } from '../controllers/hono/WarriorsOptionsNextHonoController';
import { WarriorsPatchNextHonoController } from '../controllers/hono/WarriorsPatchNextHonoController';
import { WarriorsPostNextHonoController } from '../controllers/hono/WarriorsPostNextHonoController';
import { WarriorsPutNextHonoController } from '../controllers/hono/WarriorsPutNextHonoController';
import { WarriorsDeleteNextController } from '../controllers/WarriorsDeleteNextController';
import { WarriorsGetNextController } from '../controllers/WarriorsGetNextController';
import { WarriorsOptionsNextController } from '../controllers/WarriorsOptionsNextController';
import { WarriorsPatchNextController } from '../controllers/WarriorsPatchNextController';
import { WarriorsPostNextController } from '../controllers/WarriorsPostNextController';
import { WarriorsPutNextController } from '../controllers/WarriorsPutNextController';
import { NextExpress4Middleware } from '../middlewares/NextExpress4Middleware';
import { NextExpressMiddleware } from '../middlewares/NextExpressMiddleware';
import { NextHonoMiddleware } from '../middlewares/NextHonoMiddleware';

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
    default:
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteNextController;
        case HttpMethod.get:
          return WarriorsGetNextController;
        case HttpMethod.options:
          return WarriorsOptionsNextController;
        case HttpMethod.patch:
          return WarriorsPatchNextController;
        case HttpMethod.post:
          return WarriorsPostNextController;
        case HttpMethod.put:
          return WarriorsPutNextController;
      }
  }
}

function getWarriorNextMiddleware(
  serverKind: ServerKind,
): NewableFunction | undefined {
  switch (serverKind) {
    case ServerKind.express:
      return NextExpressMiddleware;
    case ServerKind.express4:
      return NextExpress4Middleware;
    case ServerKind.hono:
      return NextHonoMiddleware;
    default:
      return undefined;
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

  if (middleware !== undefined) {
    container.bind(middleware).toSelf().inSingletonScope();
  }
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
