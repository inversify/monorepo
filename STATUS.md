# rflct Integration Status

> Auto-generated status of rflct migration across the inversify monorepo.
> Last updated: 2026-08-29 (run 10 — strongly-typed migrated to rflct type aliases)

## Container Packages

| Package | Build | Test | Coverage | Param Decorator Migration | Notes |
|---------|-------|------|----------|---------------------------|-------|
| `@inversifyjs/core` | ✅ | ✅ 1296/1296 | 90% Stmts · 81% Branch | ✅ `Inject` `InjectOptional` `InjectNamed` `InjectTagged` `InjectMulti` `InjectMultiChained` `InjectUnmanaged` `PostConstruct` `PreDestroy` `Injectable` | rflct bridge, metadata reader, lifecycle |
| `@inversifyjs/container` | ✅ | ✅ 517/517 | 93% Stmts · 88% Branch | ✅ (uses core types) | **FIXED**: rflct plugin propagated into vitest projects via `buildConfig()`, service identifier binding fix |
| `inversify` | ✅ | ✅ 508/508 | — (int tests only) | ✅ (uses core types) | All decorator tests migrated to rflct types |
| `@inversifyjs/common` | ✅ | ✅ 24/24 | 100% | N/A | No rflct changes needed |
| `@inversifyjs/plugin` | ✅ | ✅ | — | N/A | No rflct changes needed |
| `@inversifyjs/plugin-dispose` | ✅ | ✅ 49/49 | 58% Stmts · 53% Branch | N/A | No rflct changes needed |
| `@inversifyjs/binding-decorators` | ✅ | ✅ 14/14 | 88% Stmts · 75% Branch | N/A | |
| `@inversifyjs/strongly-typed` | ✅ | ✅ 46/46 | 100% | ✅ `TypedInject<TKey, TMap>` `TypedMultiInject<TKey, TMap>` | **FIXED**: Decorator-based `TypedInject` replaced with rflct type aliases; tests use class declarations with type annotations |
| `@inversifyjs/container-e2e-tests` | ❌ | — | — | — | `@rollup/plugin-typescript` incompatible with TS7 |
| `@inversifyjs/container-benchmarks` | ❌ | — | — | — | Cascading build failure |
| `@inversifyjs/plugin-example` | ✅ | — | — | N/A | No test script |
| `@inversifyjs/plugin-usage-example` | ✅ | — | — | N/A | No test script |

## Foundation Packages

| Package | Build | Test | Coverage | Notes |
|---------|-------|------|----------|-------|
| `@inversifyjs/reflect-metadata-utils` | ✅ | ✅ 55/55 | 100% | |
| `@inversifyjs/prototype-utils` | ✅ | ✅ 11/11 | 100% | |
| `@inversifyjs/eslint-plugin-require-extensions` | ✅ | ❌ | — (int tests only) | Pre-existing failure (unrelated to rflct) |
| `@inversifyjs/foundation-eslint-config` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-prettier-config` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-rollup-config` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-typescript-config` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-vitest-config` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-stryker-config` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-scripts` | ✅ | — | — | Config package |
| `@inversifyjs/foundation-changelog-generator` | ✅ | — | — | Config package |
| `@inversifyjs/benchmark-utils` | ✅ | — | — | No test script |

## Framework Packages

| Package | Build | Test | Coverage | Param Decorator Migration | Notes |
|---------|-------|------|----------|---------------------------|-------|
| `@inversifyjs/framework-core` | ✅ | ✅ 87/87 | 96% Stmts · 88% Branch | N/A | TC39 decorators with `context.metadata` finalization pattern |
| `@inversifyjs/http-core` | ✅ | ✅ 261/261 | 72% Stmts · 50% Branch | ✅ `BodyParam` `QueryParam` `RouteParam` `HeaderParam` `CookieParam` `RequestParam` `ResponseParam` | **FIXED**: Build via `rflct` CLI; TC39 `context.metadata` finalization; all specs pass |
| `@inversifyjs/http-express` | ✅ | ✅ | — (int tests only) | N/A | Adapter only |
| `@inversifyjs/http-express-v4` | ✅ | ✅ | — (int tests only) | N/A | Adapter only |
| `@inversifyjs/http-fastify` | ✅ | ✅ | — (int tests only) | N/A | Adapter only |
| `@inversifyjs/http-hono` | ✅ | ❌ 2 failed | — (int tests only) | N/A | Int spec assertion failures (middleware/CORS) |
| `@inversifyjs/http-uwebsockets` | ❌ | ⚠️ 105/105 (2 files fail to load) | 67% Stmts · 59% Branch | N/A | **REGRESSED**: CaptureRequestValues decorator signature mismatch in int spec (TS1241) |
| `@inversifyjs/http-sse` | ✅ | ✅ 125/125 | 93% Stmts · 71% Branch | ✅ `SsePublisher('param')` | **FIXED**: All specs pass with TC39 `context.metadata` finalization |
| `@inversifyjs/http-open-api` | ✅ | ⚠️ 694/742 (48 int spec failures) | 90% Stmts · 90% Branch | N/A | Pre-existing int spec path resolution failures in Swagger UI serving |
| `@inversifyjs/http-better-auth` | ❌ | ❌ 30 pass, 6 skip (11 files fail to load) | 100% | ✅ `ExpressUserSession('param')` `FastifyUserSession('param')` `HonoUserSession('param')` | `createCustomParameterMethodDecorator` API + SyntaxError in int specs |
| `@inversifyjs/http-validation` | ✅ | ✅ 2/2 | 100% | N/A | **FIXED**: SWC decorator plugin resolves SyntaxError |
| `@inversifyjs/http-e2e-tests` | ❌ | — | — | — | `@rollup/plugin-typescript` + TS7; also has TS1206 param decorator errors |
| `@inversifyjs/http-benchmarks` | ❌ | — | — | N/A | NestJS decorator incompatibility (TS1241/TS1270) |
| `@inversifyjs/http-openapi-example` | ❌ | — | — | — | Cascading from http-better-auth build |
| `@inversifyjs/create-http` | ✅ | ✅ 71/71 | 75% Stmts · 58% Branch | — | |
| `@inversifyjs/config` | ✅ | ✅ 29/29 | 95% Stmts · 93% Branch | N/A | Build via `rflct` CLI; `resolve<ConfigService>()` auto-replaced |
| `@inversifyjs/config-dotenv` | ✅ | ✅ 4/4 | 100% Stmts · 89% Branch | N/A | Fixed (cascading from config) |
| `@inversifyjs/config-yaml` | ✅ | ✅ 4/4 | 100% | N/A | Fixed (cascading from config) |
| `@inversifyjs/validation-common` | ✅ | ✅ | — | N/A | No decorators |
| `@inversifyjs/ajv-validation` | ❌ | ❌ 21 pass, 3 skip (3 files fail to load) | 100% | ✅ `ValidateAjvSchema({ param: schemas })` | `context.addInitializer` + SyntaxError in int specs |
| `@inversifyjs/class-validation` | ❌ | ⚠️ 37/37 (1 file fails to load) | 100% | ✅ `ClassValidationPipe` | SyntaxError in int spec |
| `@inversifyjs/standard-schema-validation` | ❌ | ❌ 8 pass, 3 skip (2 files fail to load) | 87% Stmts · 63% Branch | ✅ `ValidateStandardSchemaV1({ param: schemas })` | `context.addInitializer` + SyntaxError in int spec |
| `@inversifyjs/open-api-validation` | ✅ | ❌ 505 pass, 29 skip (5 files fail to load) | 97% Stmts · 89% Branch | ✅ `ValidatedBody('param')` `ValidatedHeaders('param')` `ValidatedParams('param')` `ValidatedQuery('param')` | `createCustomParameterMethodDecorator` API + SyntaxError in int specs |

## Other Packages

| Package | Build | Test | Coverage | Notes |
|---------|-------|------|----------|-------|
| `@inversifyjs/logger` | ✅ | ✅ 24/24 | 100% | |
| `@inversifyjs/json-schema-pointer` | ✅ | ✅ 34/34 | 80% Stmts · 75% Branch | |
| `@inversifyjs/json-schema-types` | ✅ | ✅ | — | |
| `@inversifyjs/json-schema-utils` | ✅ | ✅ 66/66 | 84% Stmts · 100% Branch | |
| `@inversifyjs/open-api-types` | ✅ | ✅ | — | |
| `@inversifyjs/open-api-utils` | ✅ | ✅ 221/221 | 100% | |
| `@inversifyjs/uri` | ✅ | ✅ 66/66 | 98% Stmts · 94% Branch | |

## Build Summary

| Metric | Count |
|--------|-------|
| Total turbo tasks | 47 |
| Build pass | 35 |
| Build fail | 12 |
| Lint | ❌ ALL (typescript-eslint does not support TS 7.0) |

## Known Issues

1. **`typescript-eslint` does not support TS 7.0**: ALL lint tasks fail. `typescript-eslint` v8.67 does not support TS7. Tracking: [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940). Not caused by rflct.

2. **`@rollup/plugin-typescript` + TypeScript 7**: 2 packages (`container-e2e-tests`, `http-e2e-tests`) use rollup with `@rollup/plugin-typescript` which doesn't support TS7's new API. Not caused by rflct.

3. **`createCustomParameterMethodDecorator(...) is not a function`**: Affects `http-better-auth`, `open-api-validation`. The `createCustomParameterMethodDecorator` API in `http-core` changed signature during TC39 migration but downstream consumers/tests weren't updated.

4. **`@inversifyjs/eslint-plugin-require-extensions` test failure**: Pre-existing, unrelated to rflct.
