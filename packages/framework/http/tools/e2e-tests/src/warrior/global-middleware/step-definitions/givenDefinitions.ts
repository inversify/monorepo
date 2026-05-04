import { Given } from '@cucumber/cucumber';
import { Middleware } from '@inversifyjs/http-core';
import { Container, Newable, ServiceIdentifier } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { setServerRequest } from '../../../server/actions/setServerRequest';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail';
import { Server } from '../../../server/models/Server';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsGetTestCorsController } from '../controllers/WarriorsGetTestCorsController';
import { CorsExpressMiddleware } from '../middlewares/express/CorsExpressMiddleware';
import { GlobalExpressMiddleware } from '../middlewares/express/GlobalExpressMiddleware';
import { CorsExpressV4Middleware } from '../middlewares/express4/CorsExpressV4Middleware';
import { GlobalExpressV4Middleware } from '../middlewares/express4/GlobalExpressV4Middleware';
import { CorsFastifyMiddleware } from '../middlewares/fastify/CorsFastifyMiddleware';
import { GlobalFastifyMiddleware } from '../middlewares/fastify/GlobalFastifyMiddleware';
import { CorsHonoMiddleware } from '../middlewares/hono/CorsHonoMiddleware';
import { GlobalHonoMiddleware } from '../middlewares/hono/GlobalHonoMiddleware';
import { GlobalUwebSocketsMiddleware } from '../middlewares/uwebsockets/GlobalUwebSocketsMiddleware';

function getGlobalMiddlewareForServerKind(
  serverKind: ServerKind,
): Newable<Middleware> {
  switch (serverKind) {
    case ServerKind.express:
      return GlobalExpressMiddleware;
    case ServerKind.express4:
      return GlobalExpressV4Middleware;
    case ServerKind.fastify:
      return GlobalFastifyMiddleware;
    case ServerKind.hono:
      return GlobalHonoMiddleware;
    case ServerKind.uwebsockets:
      return GlobalUwebSocketsMiddleware;
  }
}

function getCorsMiddlewareForServerKind(
  serverKind: ServerKind,
): Newable<Middleware> {
  switch (serverKind) {
    case ServerKind.express:
      return CorsExpressMiddleware;
    case ServerKind.express4:
      return CorsExpressV4Middleware;
    case ServerKind.fastify:
      return CorsFastifyMiddleware;
    case ServerKind.hono:
      return CorsHonoMiddleware;
    case ServerKind.uwebsockets:
      throw new Error(
        'CORS middleware not supported for uwebsockets in this scenario',
      );
  }
}

function bindGlobalMiddleware(
  this: InversifyHttpWorld,
  middlewareClass: Newable<Middleware>,
): void {
  const container: Container = getContainerOrFail.bind(this)(defaultAlias);

  container.bind(middlewareClass).toSelf().inSingletonScope();

  const existing: ServiceIdentifier<Middleware>[] =
    this.globalMiddlewares.get(defaultAlias) ?? [];

  existing.push(middlewareClass);

  this.globalMiddlewares.set(defaultAlias, existing);
}

Given<InversifyHttpWorld>(
  'a global header middleware registered for "{serverKind}" server',
  function (this: InversifyHttpWorld, serverKind: ServerKind): void {
    bindGlobalMiddleware.bind(this)(
      getGlobalMiddlewareForServerKind(serverKind),
    );
  },
);

Given<InversifyHttpWorld>(
  'a global CORS middleware registered for "{serverKind}" server',
  function (this: InversifyHttpWorld, serverKind: ServerKind): void {
    bindGlobalMiddleware.bind(this)(getCorsMiddlewareForServerKind(serverKind));
  },
);

Given<InversifyHttpWorld>(
  'a GET test-cors warrior controller for container',
  function (this: InversifyHttpWorld): void {
    const container: Container = getContainerOrFail.bind(this)(defaultAlias);

    container.bind(WarriorsGetTestCorsController).toSelf().inSingletonScope();
  },
);

Given<InversifyHttpWorld>(
  'a GET not-a-route HTTP request',
  function (this: InversifyHttpWorld): void {
    const server: Server = getServerOrFail.bind(this)(defaultAlias);
    const url: string = `http://${server.host}:${server.port.toString()}/not-a-route`;

    const request: Request = new Request(url, { method: 'GET' });

    setServerRequest.bind(this)(defaultAlias, {
      body: undefined,
      queryParameters: {},
      request,
      urlParameters: {},
    });
  },
);

Given<InversifyHttpWorld>(
  'an OPTIONS test-cors HTTP request',
  function (this: InversifyHttpWorld): void {
    const server: Server = getServerOrFail.bind(this)(defaultAlias);
    const url: string = `http://${server.host}:${server.port.toString()}/test-cors`;

    const request: Request = new Request(url, { method: 'OPTIONS' });

    setServerRequest.bind(this)(defaultAlias, {
      body: undefined,
      queryParameters: {},
      request,
      urlParameters: {},
    });
  },
);
