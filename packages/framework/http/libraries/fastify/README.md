[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhttp-fastify)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhttp-fastify)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Fhttp%2Flibraries%2Ffastify%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/http-fastify)

# @inversifyjs/http-fastify

Inversify monorepo fastify package.

## Global pre-handler middlewares

Global pre-handler middlewares (registered via `applyGlobalMiddleware` without `isPostHandler: true`) run at Fastify's `onRequest` lifecycle stage, before body parsing (`preParsing`). As a result, calling `getBody(request)` inside such a middleware returns `undefined`. Headers, query string, and path params are available at this stage.
