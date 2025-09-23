---
"@inversifyjs/http-open-api": major
---

Removed library specific providers in favor of library specific package usage

Instead of importing `SwaggerUiExpress4Provider`, import `SwaggerUiExpress4Provider` from `@inversifyjs/express-4-open-api`.
Instead of importing `SwaggerUiExpressProvider`, import `SwaggerUiExpressProvider` from `@inversifyjs/express-open-api`.
Instead of importing `SwaggerUiFastifyProvider`, import `SwaggerUiFastifyProvider` from `@inversifyjs/fastify-open-api`.
Instead of importing `SwaggerUiHonoProvider`, import `SwaggerUiHonoProvider` from `@inversifyjs/hono-open-api`.
