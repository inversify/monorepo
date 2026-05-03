[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhttp-uwebsockets)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhttp-uwebsockets) [![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Fhttp%2Flibraries%2Fuwebsockets%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/http-uwebsockets)

# @inversifyjs/http-uwebsockets

Inversify monorepo http uwebsockets modules.

## Global pre-handler middlewares

uWebSockets.js has no native global-middleware hook. Global pre-handler middlewares (registered via `applyGlobalMiddleware` without `isPostHandler: true`) are implemented by chaining them into the handler list of every registered route. Additionally, a wildcard fallback route (`app.any('/*', ...)`) is registered after all controller routes to ensure the global pre-handlers also fire for requests to unmatched paths. The fallback route ends the response with HTTP 404 after running the global pre-handler chain.
