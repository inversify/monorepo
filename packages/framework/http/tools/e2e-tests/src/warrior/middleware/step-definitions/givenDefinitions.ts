import { Given } from '@cucumber/cucumber';
import { Middleware } from '@inversifyjs/http-core';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsDeleteSuccessfulExpressMiddlewareController.js';
import { WarriorsDeleteUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsDeleteUnsuccessfulExpressMiddlewareController.js';
import { WarriorsGetSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsGetSuccessfulExpressMiddlewareController.js';
import { WarriorsGetUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsGetUnsuccessfulExpressMiddlewareController.js';
import { WarriorsOptionsSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsOptionsSuccessfulExpressMiddlewareController.js';
import { WarriorsOptionsUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsOptionsUnsuccessfulExpressMiddlewareController.js';
import { WarriorsPatchSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPatchSuccessfulExpressMiddlewareController.js';
import { WarriorsPatchUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPatchUnsuccessfulExpressMiddlewareController.js';
import { WarriorsPostSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPostSuccessfulExpressMiddlewareController.js';
import { WarriorsPostUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPostUnsuccessfulExpressMiddlewareController.js';
import { WarriorsPutSuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPutSuccessfulExpressMiddlewareController.js';
import { WarriorsPutUnsuccessfulExpressMiddlewareController } from '../controllers/express/WarriorsPutUnsuccessfulExpressMiddlewareController.js';
import { WarriorsDeleteSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsDeleteSuccessfulExpressV4MiddlewareController.js';
import { WarriorsDeleteUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsDeleteUnsuccessfulExpressV4MiddlewareController.js';
import { WarriorsGetSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsGetSuccessfulExpressV4MiddlewareController.js';
import { WarriorsGetUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsGetUnsuccessfulExpressV4MiddlewareController.js';
import { WarriorsOptionsSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsOptionsSuccessfulExpressV4MiddlewareController.js';
import { WarriorsOptionsUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsOptionsUnsuccessfulExpressV4MiddlewareController.js';
import { WarriorsPatchSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPatchSuccessfulExpressV4MiddlewareController.js';
import { WarriorsPatchUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPatchUnsuccessfulExpressV4MiddlewareController.js';
import { WarriorsPostSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPostSuccessfulExpressV4MiddlewareController.js';
import { WarriorsPostUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPostUnsuccessfulExpressV4MiddlewareController.js';
import { WarriorsPutSuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPutSuccessfulExpressV4MiddlewareController.js';
import { WarriorsPutUnsuccessfulExpressV4MiddlewareController } from '../controllers/express4/WarriorsPutUnsuccessfulExpressV4MiddlewareController.js';
import { WarriorsDeleteSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsDeleteSuccessfulFastifyMiddlewareController.js';
import { WarriorsDeleteUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsDeleteUnsuccessfulFastifyMiddlewareController.js';
import { WarriorsGetSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsGetSuccessfulFastifyMiddlewareController.js';
import { WarriorsGetUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsGetUnsuccessfulFastifyMiddlewareController.js';
import { WarriorsOptionsSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsOptionsSuccessfulFastifyMiddlewareController.js';
import { WarriorsOptionsUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsOptionsUnsuccessfulFastifyMiddlewareController.js';
import { WarriorsPatchSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPatchSuccessfulFastifyMiddlewareController.js';
import { WarriorsPatchUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPatchUnsuccessfulFastifyMiddlewareController.js';
import { WarriorsPostSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPostSuccessfulFastifyMiddlewareController.js';
import { WarriorsPostUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPostUnsuccessfulFastifyMiddlewareController.js';
import { WarriorsPutSuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPutSuccessfulFastifyMiddlewareController.js';
import { WarriorsPutUnsuccessfulFastifyMiddlewareController } from '../controllers/fastify/WarriorsPutUnsuccessfulFastifyMiddlewareController.js';
import { WarriorsDeleteSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsDeleteSuccessfulHonoMiddlewareController.js';
import { WarriorsDeleteUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsDeleteUnsuccessfulHonoMiddlewareController.js';
import { WarriorsGetSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsGetSuccessfulHonoMiddlewareController.js';
import { WarriorsGetUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsGetUnsuccessfulHonoMiddlewareController.js';
import { WarriorsOptionsSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsOptionsSuccessfulHonoMiddlewareController.js';
import { WarriorsOptionsUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsOptionsUnsuccessfulHonoMiddlewareController.js';
import { WarriorsPatchSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPatchSuccessfulHonoMiddlewareController.js';
import { WarriorsPatchUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPatchUnsuccessfulHonoMiddlewareController.js';
import { WarriorsPostSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPostSuccessfulHonoMiddlewareController.js';
import { WarriorsPostUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPostUnsuccessfulHonoMiddlewareController.js';
import { WarriorsPutSuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPutSuccessfulHonoMiddlewareController.js';
import { WarriorsPutUnsuccessfulHonoMiddlewareController } from '../controllers/hono/WarriorsPutUnsuccessfulHonoMiddlewareController.js';
import { WarriorsDeleteSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsDeleteSuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsDeleteUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsDeleteUnsuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsGetSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsGetSuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsGetUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsGetUnsuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsOptionsSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsOptionsSuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsOptionsUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsOptionsUnsuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsPatchSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPatchSuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsPatchUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPatchUnsuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsPostSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPostSuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsPostUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPostUnsuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsPutSuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPutSuccessfulUwebSocketsMiddlewareController.js';
import { WarriorsPutUnsuccessfulUwebSocketsMiddlewareController } from '../controllers/uwebsockets/WarriorsPutUnsuccessfulUwebSocketsMiddlewareController.js';
import { SuccessfulExpressMiddleware } from '../middlewares/express/SuccessfulExpressMiddleware.js';
import { UnsuccessfulExpressMiddleware } from '../middlewares/express/UnsuccessfulExpressMiddleware.js';
import { SuccessfulExpressV4Middleware } from '../middlewares/express4/SuccessfulExpressV4Middleware.js';
import { UnsuccessfulExpressV4Middleware } from '../middlewares/express4/UnsuccessfulExpressV4Middleware.js';
import { SuccessfulFastifyMiddleware } from '../middlewares/fastify/SuccessfulFastifyMiddleware.js';
import { UnsuccessfulFastifyMiddleware } from '../middlewares/fastify/UnsuccessfulFastifyMiddleware.js';
import { SuccessfulHonoMiddleware } from '../middlewares/hono/SuccessfulHonoMiddleware.js';
import { UnsuccessfulHonoMiddleware } from '../middlewares/hono/UnsuccessfulHonoMiddleware.js';
import { SuccessfulUwebSocketsMiddleware } from '../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware.js';
import { UnsuccessfulUwebSocketsMiddleware } from '../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware.js';

function getMethodWarriorSuccessfulExpressMiddlewareController(
  method: HttpMethod,
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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
): Newable {
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

  let getMethodWarriorSuccessfulController: (method: HttpMethod) => Newable;

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

  const controller: Newable = getMethodWarriorSuccessfulController(method);

  let middleware: Newable<Middleware>;
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

  let getMethodWarriorUnsuccessfulController: (method: HttpMethod) => Newable;

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

  const controller: Newable = getMethodWarriorUnsuccessfulController(method);

  let successfulMiddleware: Newable<Middleware>;

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

  let unsuccessfulMiddleware: Newable<Middleware>;

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
