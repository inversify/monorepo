import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsDeleteSuccessfulExpressMiddlewareController';
import { WarriorsDeleteUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsDeleteUnsuccessfulExpressMiddlewareController';
import { WarriorsGetSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsGetSuccessfulExpressMiddlewareController';
import { WarriorsGetUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsGetUnsuccessfulExpressMiddlewareController';
import { WarriorsOptionsSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsOptionsSuccessfulExpressMiddlewareController';
import { WarriorsOptionsUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsOptionsUnsuccessfulExpressMiddlewareController';
import { WarriorsPatchSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPatchSuccessfulExpressMiddlewareController';
import { WarriorsPatchUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPatchUnsuccessfulExpressMiddlewareController';
import { WarriorsPostSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPostSuccessfulExpressMiddlewareController';
import { WarriorsPostUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPostUnsuccessfulExpressMiddlewareController';
import { WarriorsPutSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPutSuccessfulExpressMiddlewareController';
import { WarriorsPutUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPutUnsuccessfulExpressMiddlewareController';
import { WarriorsDeleteSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsDeleteSuccessfulExpressV4MiddlewareController';
import { WarriorsDeleteUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsDeleteUnsuccessfulExpressV4MiddlewareController';
import { WarriorsGetSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsGetSuccessfulExpressV4MiddlewareController';
import { WarriorsGetUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsGetUnsuccessfulExpressV4MiddlewareController';
import { WarriorsOptionsSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsOptionsSuccessfulExpressV4MiddlewareController';
import { WarriorsOptionsUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsOptionsUnsuccessfulExpressV4MiddlewareController';
import { WarriorsPatchSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPatchSuccessfulExpressV4MiddlewareController';
import { WarriorsPatchUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPatchUnsuccessfulExpressV4MiddlewareController';
import { WarriorsPostSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPostSuccessfulExpressV4MiddlewareController';
import { WarriorsPostUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPostUnsuccessfulExpressV4MiddlewareController';
import { WarriorsPutSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPutSuccessfulExpressV4MiddlewareController';
import { WarriorsPutUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPutUnsuccessfulExpressV4MiddlewareController';
import { WarriorsDeleteSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsDeleteSuccessfulFastifyMiddlewareController';
import { WarriorsDeleteUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsDeleteUnsuccessfulFastifyMiddlewareController';
import { WarriorsGetSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsGetSuccessfulFastifyMiddlewareController';
import { WarriorsGetUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsGetUnsuccessfulFastifyMiddlewareController';
import { WarriorsOptionsSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsOptionsSuccessfulFastifyMiddlewareController';
import { WarriorsOptionsUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsOptionsUnsuccessfulFastifyMiddlewareController';
import { WarriorsPatchSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPatchSuccessfulFastifyMiddlewareController';
import { WarriorsPatchUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPatchUnsuccessfulFastifyMiddlewareController';
import { WarriorsPostSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPostSuccessfulFastifyMiddlewareController';
import { WarriorsPostUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPostUnsuccessfulFastifyMiddlewareController';
import { WarriorsPutSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPutSuccessfulFastifyMiddlewareController';
import { WarriorsPutUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPutUnsuccessfulFastifyMiddlewareController';
import { WarriorsDeleteSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsDeleteSuccessfulHonoMiddlewareController';
import { WarriorsDeleteUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsDeleteUnsuccessfulHonoMiddlewareController';
import { WarriorsGetSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsGetSuccessfulHonoMiddlewareController';
import { WarriorsGetUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsGetUnsuccessfulHonoMiddlewareController';
import { WarriorsOptionsSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsOptionsSuccessfulHonoMiddlewareController';
import { WarriorsOptionsUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsOptionsUnsuccessfulHonoMiddlewareController';
import { WarriorsPatchSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPatchSuccessfulHonoMiddlewareController';
import { WarriorsPatchUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPatchUnsuccessfulHonoMiddlewareController';
import { WarriorsPostSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPostSuccessfulHonoMiddlewareController';
import { WarriorsPostUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPostUnsuccessfulHonoMiddlewareController';
import { WarriorsPutSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPutSuccessfulHonoMiddlewareController';
import { WarriorsPutUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPutUnsuccessfulHonoMiddlewareController';
import { WarriorsDeleteSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsDeleteSuccessfulUwebSocketsMiddlewareController';
import { WarriorsDeleteUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsDeleteUnsuccessfulUwebSocketsMiddlewareController';
import { WarriorsGetSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsGetSuccessfulUwebSocketsMiddlewareController';
import { WarriorsGetUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsGetUnsuccessfulUwebSocketsMiddlewareController';
import { WarriorsOptionsSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsOptionsSuccessfulUwebSocketsMiddlewareController';
import { WarriorsOptionsUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsOptionsUnsuccessfulUwebSocketsMiddlewareController';
import { WarriorsPatchSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPatchSuccessfulUwebSocketsMiddlewareController';
import { WarriorsPatchUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPatchUnsuccessfulUwebSocketsMiddlewareController';
import { WarriorsPostSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPostSuccessfulUwebSocketsMiddlewareController';
import { WarriorsPostUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPostUnsuccessfulUwebSocketsMiddlewareController';
import { WarriorsPutSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPutSuccessfulUwebSocketsMiddlewareController';
import { WarriorsPutUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPutUnsuccessfulUwebSocketsMiddlewareController';
import { SuccessfulExpressMiddleware } from '../middlewares/express/SuccessfulExpressMiddleware';
import { UnsuccessfulExpressMiddleware } from '../middlewares/express/UnsuccessfulExpressMiddleware';
import { SuccessfulExpressV4Middleware } from '../middlewares/express4/SuccessfulExpressV4Middleware';
import { UnsuccessfulExpressV4Middleware } from '../middlewares/express4/UnsuccessfulExpressV4Middleware';
import { SuccessfulFastifyMiddleware } from '../middlewares/fastify/SuccessfulFastifyMiddleware';
import { UnsuccessfulFastifyMiddleware } from '../middlewares/fastify/UnsuccessfulFastifyMiddleware';
import { SuccessfulHonoMiddleware } from '../middlewares/hono/SuccessfulHonoMiddleware';
import { UnsuccessfulHonoMiddleware } from '../middlewares/hono/UnsuccessfulHonoMiddleware';
import { SuccessfulUwebSocketsMiddleware } from '../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware';
import { UnsuccessfulUwebSocketsMiddleware } from '../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware';

function getMethodWarriorSuccessfulExpressMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSuccessfulExpressMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetSuccessfulExpressMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsSuccessfulExpressMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchSuccessfulExpressMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostSuccessfulExpressMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutSuccessfulExpressMiddlewareController;
  }
}

function getMethodWarriorSuccessfulExpressV4MiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSuccessfulExpressV4MiddlewareController;
    case HttpMethod.get:
      return WarriorsGetSuccessfulExpressV4MiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsSuccessfulExpressV4MiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchSuccessfulExpressV4MiddlewareController;
    case HttpMethod.post:
      return WarriorsPostSuccessfulExpressV4MiddlewareController;
    case HttpMethod.put:
      return WarriorsPutSuccessfulExpressV4MiddlewareController;
  }
}

function getMethodWarriorSuccessfulFastifyMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSuccessfulFastifyMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetSuccessfulFastifyMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsSuccessfulFastifyMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchSuccessfulFastifyMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostSuccessfulFastifyMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutSuccessfulFastifyMiddlewareController;
  }
}

function getMethodWarriorSuccessfulHonoMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSuccessfulHonoMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetSuccessfulHonoMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsSuccessfulHonoMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchSuccessfulHonoMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostSuccessfulHonoMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutSuccessfulHonoMiddlewareController;
  }
}

function getMethodWarriorSuccessfulUwebSocketsMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetSuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsSuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchSuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostSuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutSuccessfulUwebSocketsMiddlewareController;
  }
}

function getMethodWarriorUnsuccessfulExpressMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUnsuccessfulExpressMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetUnsuccessfulExpressMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsUnsuccessfulExpressMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchUnsuccessfulExpressMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostUnsuccessfulExpressMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutUnsuccessfulExpressMiddlewareController;
  }
}

function getMethodWarriorUnsuccessfulExpressV4MiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUnsuccessfulExpressV4MiddlewareController;
    case HttpMethod.get:
      return WarriorsGetUnsuccessfulExpressV4MiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsUnsuccessfulExpressV4MiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchUnsuccessfulExpressV4MiddlewareController;
    case HttpMethod.post:
      return WarriorsPostUnsuccessfulExpressV4MiddlewareController;
    case HttpMethod.put:
      return WarriorsPutUnsuccessfulExpressV4MiddlewareController;
  }
}

function getMethodWarriorUnsuccessfulFastifyMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUnsuccessfulFastifyMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetUnsuccessfulFastifyMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsUnsuccessfulFastifyMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchUnsuccessfulFastifyMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostUnsuccessfulFastifyMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutUnsuccessfulFastifyMiddlewareController;
  }
}

function getMethodWarriorUnsuccessfulHonoMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUnsuccessfulHonoMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetUnsuccessfulHonoMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsUnsuccessfulHonoMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchUnsuccessfulHonoMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostUnsuccessfulHonoMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutUnsuccessfulHonoMiddlewareController;
  }
}

function getMethodWarriorUnsuccessfulUwebSocketsMiddlewareController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUnsuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.get:
      return WarriorsGetUnsuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.options:
      return WarriorsOptionsUnsuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.patch:
      return WarriorsPatchUnsuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.post:
      return WarriorsPostUnsuccessfulUwebSocketsMiddlewareController;
    case HttpMethod.put:
      return WarriorsPutUnsuccessfulUwebSocketsMiddlewareController;
  }
}

function givenWarriorSuccessfulMiddlewareControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorSuccessfulController: (
    method: HttpMethod,
  ) => NewableFunction;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorSuccessfulController =
        getMethodWarriorSuccessfulExpressMiddlewareController;
      break;
    case ServerKind.express4:
      getMethodWarriorSuccessfulController =
        getMethodWarriorSuccessfulExpressV4MiddlewareController;
      break;
    case ServerKind.fastify:
      getMethodWarriorSuccessfulController =
        getMethodWarriorSuccessfulFastifyMiddlewareController;
      break;
    case ServerKind.hono:
      getMethodWarriorSuccessfulController =
        getMethodWarriorSuccessfulHonoMiddlewareController;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorSuccessfulController =
        getMethodWarriorSuccessfulUwebSocketsMiddlewareController;
  }

  const controller: NewableFunction =
    getMethodWarriorSuccessfulController(method);

  let middleware: NewableFunction;
  switch (serverKind) {
    case ServerKind.express:
      middleware = SuccessfulExpressMiddleware;
      break;
    case ServerKind.express4:
      middleware = SuccessfulExpressV4Middleware;
      break;
    case ServerKind.fastify:
      middleware = SuccessfulFastifyMiddleware;
      break;
    case ServerKind.hono:
      middleware = SuccessfulHonoMiddleware;
      break;
    case ServerKind.uwebsockets:
      middleware = SuccessfulUwebSocketsMiddleware;
      break;
  }

  container.bind(middleware).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorUnsuccessfulMiddlewareControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorUnsuccessfulController: (
    method: HttpMethod,
  ) => NewableFunction;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorUnsuccessfulController =
        getMethodWarriorUnsuccessfulExpressMiddlewareController;
      break;
    case ServerKind.express4:
      getMethodWarriorUnsuccessfulController =
        getMethodWarriorUnsuccessfulExpressV4MiddlewareController;
      break;
    case ServerKind.fastify:
      getMethodWarriorUnsuccessfulController =
        getMethodWarriorUnsuccessfulFastifyMiddlewareController;
      break;
    case ServerKind.hono:
      getMethodWarriorUnsuccessfulController =
        getMethodWarriorUnsuccessfulHonoMiddlewareController;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorUnsuccessfulController =
        getMethodWarriorUnsuccessfulUwebSocketsMiddlewareController;
      break;
  }

  const controller: NewableFunction =
    getMethodWarriorUnsuccessfulController(method);

  let successfulMiddleware: NewableFunction;

  switch (serverKind) {
    case ServerKind.express:
      successfulMiddleware = SuccessfulExpressMiddleware;
      break;
    case ServerKind.express4:
      successfulMiddleware = SuccessfulExpressV4Middleware;
      break;
    case ServerKind.fastify:
      successfulMiddleware = SuccessfulFastifyMiddleware;
      break;
    case ServerKind.hono:
      successfulMiddleware = SuccessfulHonoMiddleware;
      break;
    case ServerKind.uwebsockets:
      successfulMiddleware = SuccessfulUwebSocketsMiddleware;
      break;
  }

  let unsuccessfulMiddleware: NewableFunction;

  switch (serverKind) {
    case ServerKind.express:
      unsuccessfulMiddleware = UnsuccessfulExpressMiddleware;
      break;
    case ServerKind.express4:
      unsuccessfulMiddleware = UnsuccessfulExpressV4Middleware;
      break;
    case ServerKind.fastify:
      unsuccessfulMiddleware = UnsuccessfulFastifyMiddleware;
      break;
    case ServerKind.hono:
      unsuccessfulMiddleware = UnsuccessfulHonoMiddleware;
      break;
    case ServerKind.uwebsockets:
      unsuccessfulMiddleware = UnsuccessfulUwebSocketsMiddleware;
      break;
  }

  container.bind(successfulMiddleware).toSelf().inSingletonScope();
  container.bind(unsuccessfulMiddleware).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with SuccessfulMiddleware for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorSuccessfulMiddlewareControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with UnsuccessfulMiddleware for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorUnsuccessfulMiddlewareControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);
