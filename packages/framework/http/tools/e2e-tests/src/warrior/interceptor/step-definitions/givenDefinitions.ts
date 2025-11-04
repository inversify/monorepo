import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteExpressInterceptorController } from '../controllers/express/WarriorsDeleteExpressInterceptorController';
import { WarriorsGetExpressInterceptorController } from '../controllers/express/WarriorsGetExpressInterceptorController';
import { WarriorsPatchExpressInterceptorController } from '../controllers/express/WarriorsPatchExpressInterceptorController';
import { WarriorsPostExpressInterceptorController } from '../controllers/express/WarriorsPostExpressInterceptorController';
import { WarriorsPutExpressInterceptorController } from '../controllers/express/WarriorsPutExpressInterceptorController';
import { WarriorsDeleteExpress4InterceptorController } from '../controllers/express4/WarriorsDeleteExpress4InterceptorController';
import { WarriorsGetExpress4InterceptorController } from '../controllers/express4/WarriorsGetExpress4InterceptorController';
import { WarriorsPatchExpress4InterceptorController } from '../controllers/express4/WarriorsPatchExpress4InterceptorController';
import { WarriorsPostExpress4InterceptorController } from '../controllers/express4/WarriorsPostExpress4InterceptorController';
import { WarriorsPutExpress4InterceptorController } from '../controllers/express4/WarriorsPutExpress4InterceptorController';
import { WarriorsDeleteFastifyInterceptorController } from '../controllers/fastify/WarriorsDeleteFastifyInterceptorController';
import { WarriorsGetFastifyInterceptorController } from '../controllers/fastify/WarriorsGetFastifyInterceptorController';
import { WarriorsPatchFastifyInterceptorController } from '../controllers/fastify/WarriorsPatchFastifyInterceptorController';
import { WarriorsPostFastifyInterceptorController } from '../controllers/fastify/WarriorsPostFastifyInterceptorController';
import { WarriorsPutFastifyInterceptorController } from '../controllers/fastify/WarriorsPutFastifyInterceptorController';
import { WarriorsDeleteHonoInterceptorController } from '../controllers/hono/WarriorsDeleteHonoInterceptorController';
import { WarriorsGetHonoInterceptorController } from '../controllers/hono/WarriorsGetHonoInterceptorController';
import { WarriorsPatchHonoInterceptorController } from '../controllers/hono/WarriorsPatchHonoInterceptorController';
import { WarriorsPostHonoInterceptorController } from '../controllers/hono/WarriorsPostHonoInterceptorController';
import { WarriorsPutHonoInterceptorController } from '../controllers/hono/WarriorsPutHonoInterceptorController';
import { WarriorsDeleteUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsDeleteUwebSocketsInterceptorController';
import { WarriorsGetUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsGetUwebSocketsInterceptorController';
import { WarriorsPatchUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPatchUwebSocketsInterceptorController';
import { WarriorsPostUwebSocketsInterceptorController } from '../controllers/uwebsockets/WarriorsPostUwebSocketsInterceptorController';
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
