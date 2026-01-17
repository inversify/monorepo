import { Given } from '@cucumber/cucumber';
import { Interceptor } from '@inversifyjs/http-core';
import { Container, ServiceIdentifier } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteExpressGlobalInterceptorController } from '../controllers/express/WarriorsDeleteExpressGlobalInterceptorController';
import { WarriorsDeleteExpressInterceptorController } from '../controllers/express/WarriorsDeleteExpressInterceptorController';
import { WarriorsGetExpressGlobalInterceptorController } from '../controllers/express/WarriorsGetExpressGlobalInterceptorController';
import { WarriorsGetExpressInterceptorController } from '../controllers/express/WarriorsGetExpressInterceptorController';
import { WarriorsPatchExpressGlobalInterceptorController } from '../controllers/express/WarriorsPatchExpressGlobalInterceptorController';
import { WarriorsPatchExpressInterceptorController } from '../controllers/express/WarriorsPatchExpressInterceptorController';
import { WarriorsPostExpressGlobalInterceptorController } from '../controllers/express/WarriorsPostExpressGlobalInterceptorController';
import { WarriorsPostExpressInterceptorController } from '../controllers/express/WarriorsPostExpressInterceptorController';
import { WarriorsPutExpressGlobalInterceptorController } from '../controllers/express/WarriorsPutExpressGlobalInterceptorController';
import { WarriorsPutExpressInterceptorController } from '../controllers/express/WarriorsPutExpressInterceptorController';
import { WarriorsDeleteExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsDeleteExpress4GlobalInterceptorController';
import { WarriorsDeleteExpress4InterceptorController } from '../controllers/express4/WarriorsDeleteExpress4InterceptorController';
import { WarriorsGetExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsGetExpress4GlobalInterceptorController';
import { WarriorsGetExpress4InterceptorController } from '../controllers/express4/WarriorsGetExpress4InterceptorController';
import { WarriorsPatchExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsPatchExpress4GlobalInterceptorController';
import { WarriorsPatchExpress4InterceptorController } from '../controllers/express4/WarriorsPatchExpress4InterceptorController';
import { WarriorsPostExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsPostExpress4GlobalInterceptorController';
import { WarriorsPostExpress4InterceptorController } from '../controllers/express4/WarriorsPostExpress4InterceptorController';
import { WarriorsPutExpress4GlobalInterceptorController } from '../controllers/express4/WarriorsPutExpress4GlobalInterceptorController';
import { WarriorsPutExpress4InterceptorController } from '../controllers/express4/WarriorsPutExpress4InterceptorController';
import { WarriorsDeleteFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsDeleteFastifyGlobalInterceptorController';
import { WarriorsDeleteFastifyInterceptorController } from '../controllers/fastify/WarriorsDeleteFastifyInterceptorController';
import { WarriorsGetFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsGetFastifyGlobalInterceptorController';
import { WarriorsGetFastifyInterceptorController } from '../controllers/fastify/WarriorsGetFastifyInterceptorController';
import { WarriorsPatchFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsPatchFastifyGlobalInterceptorController';
import { WarriorsPatchFastifyInterceptorController } from '../controllers/fastify/WarriorsPatchFastifyInterceptorController';
import { WarriorsPostFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsPostFastifyGlobalInterceptorController';
import { WarriorsPostFastifyInterceptorController } from '../controllers/fastify/WarriorsPostFastifyInterceptorController';
import { WarriorsPutFastifyGlobalInterceptorController } from '../controllers/fastify/WarriorsPutFastifyGlobalInterceptorController';
import { WarriorsPutFastifyInterceptorController } from '../controllers/fastify/WarriorsPutFastifyInterceptorController';
import { WarriorsDeleteHonoGlobalInterceptorController } from '../controllers/hono/WarriorsDeleteHonoGlobalInterceptorController';
import { WarriorsDeleteHonoInterceptorController } from '../controllers/hono/WarriorsDeleteHonoInterceptorController';
import { WarriorsGetHonoGlobalInterceptorController } from '../controllers/hono/WarriorsGetHonoGlobalInterceptorController';
import { WarriorsGetHonoInterceptorController } from '../controllers/hono/WarriorsGetHonoInterceptorController';
import { WarriorsPatchHonoGlobalInterceptorController } from '../controllers/hono/WarriorsPatchHonoGlobalInterceptorController';
import { WarriorsPatchHonoInterceptorController } from '../controllers/hono/WarriorsPatchHonoInterceptorController';
import { WarriorsPostHonoGlobalInterceptorController } from '../controllers/hono/WarriorsPostHonoGlobalInterceptorController';
import { WarriorsPostHonoInterceptorController } from '../controllers/hono/WarriorsPostHonoInterceptorController';
import { WarriorsPutHonoGlobalInterceptorController } from '../controllers/hono/WarriorsPutHonoGlobalInterceptorController';
import { WarriorsPutHonoInterceptorController } from '../controllers/hono/WarriorsPutHonoInterceptorController';
import { WarriorsDeleteUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsDeleteUwebSocketsGlobalInterceptorController';
import { WarriorsDeleteUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsDeleteUwebSocketsInterceptorController';
import { WarriorsGetUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsGetUwebSocketsGlobalInterceptorController';
import { WarriorsGetUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsGetUwebSocketsInterceptorController';
import { WarriorsPatchUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsPatchUwebSocketsGlobalInterceptorController';
import { WarriorsPatchUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPatchUwebSocketsInterceptorController';
import { WarriorsPostUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsPostUwebSocketsGlobalInterceptorController';
import { WarriorsPostUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPostUwebSocketsInterceptorController';
import { WarriorsPutUwebSocketsGlobalInterceptorController } from '../controllers/uwebsockets/WarriorsPutUwebSocketsGlobalInterceptorController';
import { WarriorsPutUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPutUwebSocketsInterceptorController';
import { WarriorRouteExpressInterceptor } from '../interceptors/express/WarriorRouteExpressInterceptor';
import { WarriorRouteExpressV4Interceptor } from '../interceptors/express4/WarriorRouteExpressV4Interceptor';
import { WarriorRouteFastifyInterceptor } from '../interceptors/fastify/WarriorRouteFastifyInterceptor';
import { WarriorRouteHonoInterceptor } from '../interceptors/hono/WarriorRouteHonoInterceptor';
import { WarriorRouteUwebSocketsInterceptor } from '../interceptors/uwebsockets/WarriorRouteUwebSocketsInterceptor';

function getMethodWarriorExpressInterceptorController(
  method: HttpMethod,
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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

  let getMethodWarriorController: (method: HttpMethod) => NewableFunction;

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

  const controller: NewableFunction = getMethodWarriorController(method);

  let interceptor: NewableFunction;
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
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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
): NewableFunction {
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

  let getMethodWarriorController: (method: HttpMethod) => NewableFunction;

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

  const controller: NewableFunction = getMethodWarriorController(method);

  let interceptor: NewableFunction;
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
