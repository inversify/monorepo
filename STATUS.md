# rflct Integration Status

> Auto-generated status of rflct migration across the inversify monorepo.
> Last updated: 2026-08-27

## Container Packages

| Package | Build | Test | Notes |
|---------|-------|------|-------|
| `@inversifyjs/core` | ✅ | ✅ 1288/1288 | rflct bridge, metadata reader, lifecycle |
| `@inversifyjs/container` | ✅ | ❌ 508/517 | 9 integration tests failing (Arsenal/Gun binding tests) |
| `inversify` | ✅ | ✅ 508/508 | All decorator tests migrated to rflct types |
| `@inversifyjs/common` | ✅ | ✅ 24/24 | No rflct changes needed |
| `@inversifyjs/plugin` | ✅ | ✅ | No rflct changes needed |
| `@inversifyjs/plugin-dispose` | ✅ | ✅ 49/49 | No rflct changes needed |
| `@inversifyjs/binding-decorators` | ✅ | — | No test script |
| `@inversifyjs/strongly-typed` | ✅ | — | No test script |
| `@inversifyjs/container-e2e-tests` | ❌ | — | `@rollup/plugin-typescript` incompatible with TS7 |
| `@inversifyjs/container-benchmarks` | ❌ | — | Depends on `inversify` build (cascading) |
| `@inversifyjs/plugin-example` | ✅ | — | No test script |
| `@inversifyjs/plugin-usage-example` | ✅ | — | No test script |

## Foundation Packages

| Package | Build | Test | Notes |
|---------|-------|------|-------|
| `@inversifyjs/reflect-metadata-utils` | ✅ | ✅ 55/55 | |
| `@inversifyjs/prototype-utils` | ✅ | ✅ 11/11 | |
| `@inversifyjs/eslint-plugin-require-extensions` | ✅ | ❌ | Pre-existing failure (unrelated to rflct) |
| `@inversifyjs/foundation-eslint-config` | ✅ | — | Config package |
| `@inversifyjs/foundation-prettier-config` | ✅ | — | Config package |
| `@inversifyjs/foundation-rollup-config` | ✅ | — | Config package |
| `@inversifyjs/foundation-typescript-config` | ✅ | — | Config package |
| `@inversifyjs/foundation-vitest-config` | ✅ | — | Config package |
| `@inversifyjs/foundation-stryker-config` | ✅ | — | Config package |
| `@inversifyjs/foundation-scripts` | ✅ | — | Config package |
| `@inversifyjs/foundation-changelog-generator` | ✅ | — | Config package |
| `@inversifyjs/benchmark-utils` | ✅ | — | No test script |

## Framework Packages

| Package | Build | Test | Notes |
|---------|-------|------|-------|
| `@inversifyjs/framework-core` | ✅ | ✅ | |
| `@inversifyjs/http-core` | ✅ | ✅ | |
| `@inversifyjs/http-express` | ✅ | ✅ | |
| `@inversifyjs/http-express-v4` | ✅ | ✅ | |
| `@inversifyjs/http-fastify` | ✅ | ✅ | |
| `@inversifyjs/http-hono` | ✅ | ✅ | |
| `@inversifyjs/http-uwebsockets` | ✅ | ✅ | |
| `@inversifyjs/http-sse` | ✅ | ✅ | |
| `@inversifyjs/http-open-api` | ✅ | ✅ | |
| `@inversifyjs/http-better-auth` | ✅ | ✅ | |
| `@inversifyjs/http-validation` | ✅ | ✅ | |
| `@inversifyjs/http-e2e-tests` | ❌ | — | `@rollup/plugin-typescript` incompatible with TS7 |
| `@inversifyjs/http-benchmarks` | ✅ | — | No test script |
| `@inversifyjs/http-openapi-example` | ✅ | — | |
| `@inversifyjs/create-http` | ✅ | — | |
| `@inversifyjs/config` | ✅ | ✅ | |
| `@inversifyjs/config-dotenv` | ✅ | ✅ | |
| `@inversifyjs/config-yaml` | ✅ | ✅ | |
| `@inversifyjs/validation-common` | ✅ | ✅ | |
| `@inversifyjs/ajv-validation` | ✅ | ✅ | |
| `@inversifyjs/class-validation` | ✅ | ✅ | |
| `@inversifyjs/standard-schema-validation` | ✅ | ✅ | |
| `@inversifyjs/open-api-validation` | ✅ | ✅ | |

## Other Packages

| Package | Build | Test | Notes |
|---------|-------|------|-------|
| `@inversifyjs/logger` | ✅ | ✅ 24/24 | |
| `@inversifyjs/json-schema-pointer` | ✅ | ✅ | |
| `@inversifyjs/json-schema-types` | ✅ | ✅ | |
| `@inversifyjs/json-schema-utils` | ✅ | ✅ | |
| `@inversifyjs/open-api-types` | ✅ | ✅ | |
| `@inversifyjs/open-api-utils` | ✅ | ✅ | |
| `@inversifyjs/uri` | ✅ | ✅ | |

## Build Summary

| Metric | Count |
|--------|-------|
| Total packages | 55 |
| Build pass | 44/47 |
| Build fail | 3 (all `@rollup/plugin-typescript` + TS7) |
| Build N/A | 8 (config/tool packages without build) |

## Known Issues

1. **`@rollup/plugin-typescript` + TypeScript 7**: 3 packages use rollup with `@rollup/plugin-typescript` which doesn't support TS7's new API (`Cannot read properties of undefined (reading 'ES2015')`). Not caused by rflct.

2. **`@inversifyjs/container` test failures (9)**: Arsenal/Gun binding integration tests fail. Likely a reflect-metadata polyfill loading order issue in tests that were migrated from decorator-based to rflct-based.

3. **`@inversifyjs/eslint-plugin-require-extensions` test failure**: Pre-existing, unrelated to rflct.

## rflct Package

| | Status |
|---|---|
| Build | ✅ |
| Test | ✅ 9/9 |
| Scope-aware declarations | ✅ |
| Nested class/interface support | ✅ |
| Alias config (`reflectAliases`) | ✅ |
| `resolve<Interface>()` | ✅ |
| Computed property keys | ✅ |
