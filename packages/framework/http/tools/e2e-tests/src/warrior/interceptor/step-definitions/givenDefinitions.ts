import { Given } from '@cucumber/cucumber';
import { Interceptor } from '@inversifyjs/http-core';
import { Container, Newable, ServiceIdentifier } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteExpressGlobalInterceptorController } from '../controllers/express/WarriorsDeleteExpressGlobalInterceptorController.js';
import { WarriorsDeleteExpressInterceptorController } from '../controllers/express/WarriorsDeleteExpressInterceptorController.js';
import { WarriorsGetExpressGlobalInterceptorController } from '../controllers/express/WarriorsGetExpressGlobalInterceptorController.js';
import { WarriorsGetExpressInterceptorController } from '../controllers/express/WarriorsGetExpressInterceptorController.js';
import { WarriorsPatchExpressGlobalInterceptorController } from '../controllers/express/WarriorsPatchExpressGlobalInterceptorController.js';
import { WarriorsPatchExpressInterceptorController } from '../controllers/express/WarriorsPatchExpressInterceptorController.js';
import { WarriorsPostExpressGlobalInterceptorController } from '../controllers/express/WarriorsPostExpressGlobalInterceptorController.js';
import { WarriorsPostExpressInterceptorController } from '../controllers/express/WarriorsPostExpressInterceptorController.js';
import { WarriorsPutExpressGlobalInterceptorController } from '../controllers/express/WarriorsPutExpressGlobalInterceptorController.js';
import { WarriorsPutExpressInterceptorController } from '../controllers/express/WarriorsPutExpressInterceptorController.js';
import { WarriorsDeleteExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsDeleteExpress4GlobalInterceptorController.js';
import { WarriorsDeleteExpress4InterceptorController } from '../controllers/express4/WarriorsDeleteExpress4InterceptorController.js';
import { WarriorsGetExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsGetExpress4GlobalInterceptorController.js';
import { WarriorsGetExpress4InterceptorController } from '../controllers/express4/WarriorsGetExpress4InterceptorController.js';
import { WarriorsPatchExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsPatchExpress4GlobalInterceptorController.js';
import { WarriorsPatchExpress4InterceptorController } from '../controllers/express4/WarriorsPatchExpress4InterceptorController.js';
import { WarriorsPostExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsPostExpress4GlobalInterceptorController.js';
import { WarriorsPostExpress4InterceptorController } from '../controllers/express4/WarriorsPostExpress4InterceptorController.js';
import { WarriorsPutExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsPutExpress4GlobalInterceptorController.js';
import { WarriorsPutExpress4InterceptorController } from '../controllers/express4/WarriorsPutExpress4InterceptorController.js';
import { WarriorsDeleteFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsDeleteFastifyGlobalInterceptorController.js';
import { WarriorsDeleteFastifyInterceptorController } from '../controllers/fastify/WarriorsDeleteFastifyInterceptorController.js';
import { WarriorsGetFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsGetFastifyGlobalInterceptorController.js';
import { WarriorsGetFastifyInterceptorController } from '../controllers/fastify/WarriorsGetFastifyInterceptorController.js';
import { WarriorsPatchFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsPatchFastifyGlobalInterceptorController.js';
import { WarriorsPatchFastifyInterceptorController } from '../controllers/fastify/WarriorsPatchFastifyInterceptorController.js';
import { WarriorsPostFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsPostFastifyGlobalInterceptorController.js';
import { WarriorsPostFastifyInterceptorController } from '../controllers/fastify/WarriorsPostFastifyInterceptorController.js';
import { WarriorsPutFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsPutFastifyGlobalInterceptorController.js';
import { WarriorsPutFastifyInterceptorController } from '../controllers/fastify/WarriorsPutFastifyInterceptorController.js';
import { WarriorsDeleteHonoGlobalInterceptorController } from '../controllers/hono/WarriorsDeleteHonoGlobalInterceptorController.js';
import { WarriorsDeleteHonoInterceptorController } from '../controllers/hono/WarriorsDeleteHonoInterceptorController.js';
import { WarriorsGetHonoGlobalInterceptorController } from '../controllers/hono/WarriorsGetHonoGlobalInterceptorController.js';
import { WarriorsGetHonoInterceptorController } from '../controllers/hono/WarriorsGetHonoInterceptorController.js';
import { WarriorsPatchHonoGlobalInterceptorController } from '../controllers/hono/WarriorsPatchHonoGlobalInterceptorController.js';
import { WarriorsPatchHonoInterceptorController } from '../controllers/hono/WarriorsPatchHonoInterceptorController.js';
import { WarriorsPostHonoGlobalInterceptorController } from '../controllers/hono/WarriorsPostHonoGlobalInterceptorController.js';
import { WarriorsPostHonoInterceptorController } from '../controllers/hono/WarriorsPostHonoInterceptorController.js';
import { WarriorsPutHonoGlobalInterceptorController } from '../controllers/hono/WarriorsPutHonoGlobalInterceptorController.js';
import { WarriorsPutHonoInterceptorController } from '../controllers/hono/WarriorsPutHonoInterceptorController.js';
import { WarriorsDeleteUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsDeleteUwebSocketsGlobalInterceptorController.js';
import { WarriorsDeleteUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsDeleteUwebSocketsInterceptorController.js';
import { WarriorsGetUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsGetUwebSocketsGlobalInterceptorController.js';
import { WarriorsGetUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsGetUwebSocketsInterceptorController.js';
import { WarriorsPatchUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsPatchUwebSocketsGlobalInterceptorController.js';
import { WarriorsPatchUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPatchUwebSocketsInterceptorController.js';
import { WarriorsPostUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsPostUwebSocketsGlobalInterceptorController.js';
import { WarriorsPostUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPostUwebSocketsInterceptorController.js';
import { WarriorsPutUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsPutUwebSocketsGlobalInterceptorController.js';
import { WarriorsPutUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPutUwebSocketsInterceptorController.js';
import { WarriorRouteExpressInterceptor } from '../interceptors/express/WarriorRouteExpressInterceptor.js';
import { WarriorRouteExpressV4Interceptor } from '../interceptors/express4/WarriorRouteExpressV4Interceptor.js';
import { WarriorRouteFastifyInterceptor } from '../interceptors/fastify/WarriorRouteFastifyInterceptor.js';
import { WarriorRouteHonoInterceptor } from '../interceptors/hono/WarriorRouteHonoInterceptor.js';
import { WarriorRouteUwebSocketsInterceptor } from '../interceptors/uwebsockets/WarriorRouteUwebSocketsInterceptor.js';

function getMethodWarriorExpressInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteExpressInterceptorController;
    case HttpMethod.get:
      return WarriorsGetExpressInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchExpressInterceptorController;
    case HttpMethod.post:
      return WarriorsPostExpressInterceptorController;
    case HttpMethod.put:
      return WarriorsPutExpressInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorExpress4InterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteExpress4InterceptorController;
    case HttpMethod.get:
      return WarriorsGetExpress4InterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchExpress4InterceptorController;
    case HttpMethod.post:
      return WarriorsPostExpress4InterceptorController;
    case HttpMethod.put:
      return WarriorsPutExpress4InterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorFastifyInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteFastifyInterceptorController;
    case HttpMethod.get:
      return WarriorsGetFastifyInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchFastifyInterceptorController;
    case HttpMethod.post:
      return WarriorsPostFastifyInterceptorController;
    case HttpMethod.put:
      return WarriorsPutFastifyInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorHonoInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteHonoInterceptorController;
    case HttpMethod.get:
      return WarriorsGetHonoInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchHonoInterceptorController;
    case HttpMethod.post:
      return WarriorsPostHonoInterceptorController;
    case HttpMethod.put:
      return WarriorsPutHonoInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorUwebSocketsInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUwebSocketsInterceptorController;
    case HttpMethod.get:
      return WarriorsGetUwebSocketsInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchUwebSocketsInterceptorController;
    case HttpMethod.post:
      return WarriorsPostUwebSocketsInterceptorController;
    case HttpMethod.put:
      return WarriorsPutUwebSocketsInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function givenWarriorInterceptorControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorController: (method: HttpMethod) => Newable;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorController = getMethodWarriorExpressInterceptorController;
      break;
    case ServerKind.express4:
      getMethodWarriorController =
        getMethodWarriorExpress4InterceptorController;
      break;
    case ServerKind.fastify:
      getMethodWarriorController = getMethodWarriorFastifyInterceptorController;
      break;
    case ServerKind.hono:
      getMethodWarriorController = getMethodWarriorHonoInterceptorController;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorController =
        getMethodWarriorUwebSocketsInterceptorController;
      break;
  }

  const controller: Newable = getMethodWarriorController(method);

  let interceptor: Newable;
  switch (serverKind) {
    case ServerKind.express:
      interceptor = WarriorRouteExpressInterceptor;
      break;
    case ServerKind.express4:
      interceptor = WarriorRouteExpressV4Interceptor;
      break;
    case ServerKind.fastify:
      interceptor = WarriorRouteFastifyInterceptor;
      break;
    case ServerKind.hono:
      interceptor = WarriorRouteHonoInterceptor;
      break;
    case ServerKind.uwebsockets:
      interceptor = WarriorRouteUwebSocketsInterceptor;
      break;
  }

  container.bind(interceptor).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

function getMethodWarriorExpressGlobalInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteExpressGlobalInterceptorController;
    case HttpMethod.get:
      return WarriorsGetExpressGlobalInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchExpressGlobalInterceptorController;
    case HttpMethod.post:
      return WarriorsPostExpressGlobalInterceptorController;
    case HttpMethod.put:
      return WarriorsPutExpressGlobalInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorExpress4GlobalInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteExpress4GlobalInterceptorController;
    case HttpMethod.get:
      return WarriorsGetExpress4GlobalInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchExpress4GlobalInterceptorController;
    case HttpMethod.post:
      return WarriorsPostExpress4GlobalInterceptorController;
    case HttpMethod.put:
      return WarriorsPutExpress4GlobalInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorFastifyGlobalInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteFastifyGlobalInterceptorController;
    case HttpMethod.get:
      return WarriorsGetFastifyGlobalInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchFastifyGlobalInterceptorController;
    case HttpMethod.post:
      return WarriorsPostFastifyGlobalInterceptorController;
    case HttpMethod.put:
      return WarriorsPutFastifyGlobalInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorHonoGlobalInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteHonoGlobalInterceptorController;
    case HttpMethod.get:
      return WarriorsGetHonoGlobalInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchHonoGlobalInterceptorController;
    case HttpMethod.post:
      return WarriorsPostHonoGlobalInterceptorController;
    case HttpMethod.put:
      return WarriorsPutHonoGlobalInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function getMethodWarriorUwebSocketsGlobalInterceptorController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUwebSocketsGlobalInterceptorController;
    case HttpMethod.get:
      return WarriorsGetUwebSocketsGlobalInterceptorController;
    case HttpMethod.patch:
      return WarriorsPatchUwebSocketsGlobalInterceptorController;
    case HttpMethod.post:
      return WarriorsPostUwebSocketsGlobalInterceptorController;
    case HttpMethod.put:
      return WarriorsPutUwebSocketsGlobalInterceptorController;
    case HttpMethod.options:
      throw new Error('OPTIONS method not supported for interceptor tests');
  }
}

function givenWarriorGlobalInterceptorControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let getMethodWarriorController: (method: HttpMethod) => Newable;

  switch (serverKind) {
    case ServerKind.express:
      getMethodWarriorController =
        getMethodWarriorExpressGlobalInterceptorController;
      break;
    case ServerKind.express4:
      getMethodWarriorController =
        getMethodWarriorExpress4GlobalInterceptorController;
      break;
    case ServerKind.fastify:
      getMethodWarriorController =
        getMethodWarriorFastifyGlobalInterceptorController;
      break;
    case ServerKind.hono:
      getMethodWarriorController =
        getMethodWarriorHonoGlobalInterceptorController;
      break;
    case ServerKind.uwebsockets:
      getMethodWarriorController =
        getMethodWarriorUwebSocketsGlobalInterceptorController;
      break;
  }

  const controller: Newable = getMethodWarriorController(method);

  let interceptor: Newable<Interceptor>;
  switch (serverKind) {
    case ServerKind.express:
      interceptor = WarriorRouteExpressInterceptor;
      break;
    case ServerKind.express4:
      interceptor = WarriorRouteExpressV4Interceptor;
      break;
    case ServerKind.fastify:
      interceptor = WarriorRouteFastifyInterceptor;
      break;
    case ServerKind.hono:
      interceptor = WarriorRouteHonoInterceptor;
      break;
    case ServerKind.uwebsockets:
      interceptor = WarriorRouteUwebSocketsInterceptor;
      break;
  }

  container.bind(interceptor).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();

  const existingInterceptors: ServiceIdentifier<Interceptor>[] =
    this.globalInterceptors.get(parsedContainerAlias) ?? [];

  existingInterceptors.push(interceptor);

  this.globalInterceptors.set(parsedContainerAlias, existingInterceptors);
}

Given<InversifyHttpWorld>(
  'a warrior controller with WarriorRouteInterceptor for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorInterceptorControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with global WarriorRouteInterceptor for "{httpMethod}" method and "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorGlobalInterceptorControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);
