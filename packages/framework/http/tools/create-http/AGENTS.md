# AGENTS.md - `@inversifyjs/create-http`

## Package Overview

CLI scaffolder that generates a standalone InversifyJS HTTP application.

Published as `@inversifyjs/create-http` with bin `create-inversify-http`.

```bash
# From this package (after build)
node ./bin/create-inversify-http.js ./my-app --pm pnpm --adapter express

# Help is generated from citty args (do not hand-write help text)
node ./bin/create-inversify-http.js --help
```

Current recipe knobs:

- **Package manager**: `npm` | `pnpm` | `yarn`
- **HTTP adapter**: `express` | `fastify` | `hono` | `uwebsockets`
- **Database adapter**: `prisma+postgresql` (default; `prisma+sqlite` planned)

Scaffolded apps include a `todo` resource (`GET /v1/todos`, `GET /v1/todos/:id`, `POST /v1/todos`, `PATCH /v1/todos/:id`, `DELETE /v1/todos/:id`) wired via Ports + `@inversifyjs/prisma`, OpenAPI docs at `/docs` via `SwaggerUiProvider`, and request validation via `OpenApiValidationPipe` + `@ValidatedBody()` / `@ValidatedParams()` / `@ValidatedQuery()`.

Planned extensions (same patterns): auth.

## Architecture

```
Recipe (CLI args / prompts)
        │
        ▼
┌───────────────────┐
│ createHttpApp     │  orchestrates file generation
└─────────┬─────────┘
          │
          ├─ composeScaffoldDependencies(catalog, httpAdapter, dbAdapter)
          │     └─ writes package.json (only selected deps)
          │
          ├─ copy static templates (tsconfig, eslint, prettier, gitignore, prisma, docker-compose, agent skills, …)
          │
          ├─ generateIndexSource() → src/index.ts
          ├─ generatePnpmWorkspaceSource(createPnpmWorkspaceSourceModel(adapter))
          │     └─ pnpm only; allowBuilds + adapter knobs (e.g. blockExoticSubdeps)
          ├─ generateYarnRcSource() → .yarnrc.yml
          │     └─ yarn only; enableScripts: false, nodeLinker: node-modules
          │     └─ package.json dependenciesMeta from createYarnRcSourceModel(adapter, dbAdapter)
          ├─ writeLoggerSourceFiles() → logger factory identifier + container module
          ├─ writeStatusSourceFiles() → status domain, v1 API, builder, controller, container module
          ├─ writeCommonSourceFiles() → shared Builder interface
          ├─ writeTodoSourceFiles(createTodoControllerSourceModel(adapter))
          │     └─ ts-morph TodoController; uwebsockets adds @CaptureRequestValues
          ├─ writeBootstrapSourceFile(createBootstrapSourceModel(adapter, dbAdapter))
          │     └─ ts-morph from BootstrapSourceModel
          │
          └─ formatGeneratedProjectSources() → prettier over `src/**/*.ts`
                          │
                          ▼
              Post steps (CLI): git init → install → build → initial commit
```

### Source layout

| Path | Role |
|---|---|
| `src/cli/` | citty command + clack prompts / spinners |
| `src/services/` | orchestration (`createHttpApp`), process runners, git, bootstrap writer |
| `src/dependencies/` | Renovate catalog composition (recipe → dep subset) |
| `src/generation/` | Programmatic TS generation (ts-morph + source models) |
| `src/calculations/` | Pure helpers (paths, package.json shape, PM commands) |
| `src/models/` | Shared enums (`HttpAdapter`, `DbAdapter`, `PackageManager`) and options |
| `templates/base/` | Static files + Renovate-tracked version catalogs |

### CLI stack

- **citty**: arg parsing, `--help` / `--version` from `defineCommand` args. Prefer adding options here so help stays auto-generated.
- **@clack/prompts**: interactive selects + progress spinners (`start` / `stop` / `error` / `cancel` per step).
- Do **not** use consola for help text; citty owns usage rendering.

## Dependency management (critical)

Scaffolded apps must **not** receive every possible dependency. Versions live in a catalog; recipes select names; composition resolves versions.

### Catalog (Renovate source of truth)

`templates/base/package.json` is a **private dependency catalog**, not the generated app's package.json.

- Lists **all** possible runtime + tooling deps with pinned versions
- Renovate's npm manager updates it automatically (`/(^|/)package\.json$/`)
- `uWebSockets.js` GitHub pin is covered by existing Renovate custom manager in `.github/renovate.json`

`templates/base/package-managers.json` pins `npm` / `pnpm` versions for the generated `packageManager` field (jsonata custom manager in renovate config).

`templates/base/yarn-berry.json` pins the Yarn Berry version written to the generated `packageManager` field (`yarn@<version>`). Corepack uses that field; Yarn Classic 1.x will refuse to run until Corepack is enabled. Renovate tracks it against [yarnpkg/berry GitHub releases](https://github.com/yarnpkg/berry/releases) (`github-releases` + `extractVersion` `@yarnpkg/cli/<version>`). Do **not** put yarn back in `package-managers.json` — the npm `yarn` package is Yarn Classic 1.x.

### Recipe specs

`src/dependencies/models/HttpAdapterDependencySpecs.ts`:

- `BASE_DEPENDENCY_NAMES` / `BASE_DEV_DEPENDENCY_NAMES` — always installed
- `HTTP_ADAPTER_DEPENDENCY_SPECS` / `DB_ADAPTER_DEPENDENCY_SPECS` — per-adapter package **names** only; optional `builtDependencies` lists packages that need install-time scripts (Yarn `package.json` `dependenciesMeta.built`)

`composeScaffoldDependencies(catalog, httpAdapter, dbAdapter)` picks catalog versions for base + selected HTTP and DB adapters only.

### Adding a new optional feature (e.g. validator) or DB adapter

1. Add package versions to `templates/base/package.json` (catalog)
2. Add a feature/adapter spec listing package names (`HTTP_ADAPTER_DEPENDENCY_SPECS` / `DB_ADAPTER_DEPENDENCY_SPECS`)
3. Extend the recipe / CLI option (`DbAdapter` enum / `HTTP_ADAPTERS`)
4. Call composition when building generated `package.json`
5. Add unit tests that assert **included** and **excluded** packages

Never hardcode versions in TypeScript source — Renovate would miss them.

## Templates vs generated code

### Static templates (`templates/base/`)

Copied (sometimes renamed) into the target app:

| Template | Generated path | Notes |
|---|---|---|
| `.gitignore.template` | `.gitignore` | **Must** use `.template` suffix in repo |
| `tsconfig.json` | `tsconfig.json` | Strict options; `src` → `dist` |
| `eslint.config.mjs.template` | `eslint.config.mjs` | **Must** use `.template` suffix in repo |
| `prettier.config.mjs.template` | `prettier.config.mjs` | Same rename pattern |
| `.env.example` | `.env.example` / `.env` | Includes `DATABASE_URL` for Postgres and `LOG_LEVELS` |
| `docker-compose.yml` | `docker-compose.yml` | PostgreSQL service |
| `prisma.config.ts.template` | `prisma.config.ts` | Prisma 7 config (`prisma/config`) |
| `prisma/` | `prisma/` | Schema, Todo model, initial migration |
| `.agents/skills/add-resource/SKILL.md` | `.agents/skills/add-resource/SKILL.md` and `.claude/skills/add-resource/SKILL.md` | Canonical agent skill for adding a complete hexagonal resource; copied to both discovery locations |
| `package.json` | _(not copied)_ | Catalog only |
| `package-managers.json` | _(not copied)_ | npm / pnpm catalog only |
| `yarn-berry.json` | _(not copied)_ | Yarn Berry version catalog |

Prisma uses the `prisma-client` generator (`output = "../src/generated/prisma"`, ESM + `.ts` sources with `.js` import extensions) so `tsc` emits the client into `dist/generated/prisma`. The folder is gitignored. Scripts: `build` runs `prisma generate && tsc`; also `db:generate`, `db:migrate`. Import `PrismaClient` from `generated/prisma/client.js`.

Generated (not copied from templates):

| Generated path | Source |
|---|---|
| `src/index.ts` | `generateIndexSource()` — top-level `await bootstrap()` |
| `pnpm-workspace.yaml` | `generatePnpmWorkspaceSource(createPnpmWorkspaceSourceModel(adapter))` — **pnpm only**; `allowBuilds` + adapter knobs |
| `.yarnrc.yml` | `generateYarnRcSource()` — **yarn only**; `enableScripts: false`, `nodeLinker: node-modules`. Selected `builtDependencies` go in generated `package.json` `dependenciesMeta` (Yarn rejects that field in `.yarnrc.yml`) |
| `src/app/scripts/bootstrap.ts` | `generateBootstrapSource(createBootstrapSourceModel(adapter, dbAdapter))` |
| `src/logger/models/loggerFactoryIdentifier.ts` | Factory service identifier |
| `src/logger/containerModules/LoggerContainerModule.ts` | Binds `(context: string) => Logger` → `ConsoleLogger` |
| `src/status/domain/models/Status.ts` | Domain model |
| `src/status/api/models/StatusV1.ts` | `GET /v1/status` response |
| `src/status/api/builders/StatusV1FromStatusBuilder.ts` | Maps domain `Status` to `StatusV1` |
| `src/status/api/controllers/StatusController.ts` | `generateStatusControllerSource()` — `GET /v1/status` → `{ status: 'ok' }` |
| `src/status/adapter/inversify/containerModules/StatusContainerModule.ts` | Binds controller and `StatusV1FromStatusBuilder` |
| `src/common/domain/modules/Builder.ts` | Shared `Builder<TInput, TOutput>` mapping contract |
| `src/todo/domain/models/Todo.ts` | Domain model (camelCase timestamps) |
| `src/todo/application/ports/TodoPersistencePort.ts` | Persistence port |
| `src/todo/application/models/todoPersistencePortIdentifier.ts` | Port service identifier |
| `src/todo/api/models/TodoV1.ts` | `GET/POST/PATCH /v1/todos` response |
| `src/todo/api/models/CreateTodoV1RequestBody.ts` | `POST /v1/todos` body |
| `src/todo/api/models/PaginatedTodosV1Response.ts` | `GET /v1/todos` response |
| `src/todo/api/models/UpdateTodoV1RequestBody.ts` | `PATCH /v1/todos/:id` body |
| `src/todo/api/builders/TodoV1FromTodoBuilder.ts` | Maps domain `Todo` to `TodoV1` |
| `src/todo/api/controllers/TodoController.ts` | `generateTodoControllerSource(createTodoControllerSourceModel(adapter))` — `GET /v1/todos`, `GET /v1/todos/:id`, `POST /v1/todos`, `PATCH /v1/todos/:id`, `DELETE /v1/todos/:id`; uwebsockets adds `@CaptureRequestValues` on POST and PATCH so `@ValidatedBody` can still read method/url/headers/(params) after the body is consumed, and `@SetHeader('Content-Type', 'application/json')` on JSON replies |
| `src/todo/adapter/prisma/adapters/PrismaTodoPersistenceAdapter.ts` | Prisma port adapter (soft delete via `deleted_at`) |
| `src/todo/adapter/prisma/builders/TodoFromPrismaTodoBuilder.ts` | Maps Prisma `Todo` to domain `Todo` |
| `src/todo/adapter/inversify/containerModules/TodoContainerModule.ts` | Binds controller and `TodoV1FromTodoBuilder` |
| `src/todo/adapter/inversify/containerModules/TodoPrismaContainerModule.ts` | Binds port → Prisma adapter and `TodoFromPrismaTodoBuilder` |

**Why `.template` for eslint/prettier configs?**  
ESLint flat config loads the nearest `eslint.config.*`. If the template keeps a real `eslint.config.mjs` under `templates/`, lint-staged/ESLint will try to load it (and fail — `@eslint/js` is not installed there). Rename on copy.

**Why `.template` for `.gitignore`?**  
`npm pack` / `pnpm pack` omit files named `.gitignore` (they are treated as ignore files, not package contents). Ship `templates/base/.gitignore.template` and rename on copy so scaffolded apps still get a `.gitignore`.

### Published files

`package.json` `files` is the pack allowlist (`bin`, `lib`, `templates`). A top-level `.npmignore` is **not** applied when `files` is set, so test output must be excluded with `!lib/**/*.spec.*` / `!lib/**/fixtures/**` there. Keep the root `.npmignore` as a fallback if `files` is removed.

This package's own `eslint.config.mjs` also `ignores: ['templates/**']`, and `.lintstagedrc.json` only lints `src/**/*.ts`.

### Programmatic generation (ts-morph / source models)

Variable TypeScript (decorators, DI wiring, adapters) and recipe-specific config files should be generated from a **source model**, not string templates with `if`s.

`pnpm-workspace.yaml` generation (pnpm only):

- Model factory: `createPnpmWorkspaceSourceModel(httpAdapter)`
- Model: `PnpmWorkspaceSourceModel` (`allowBuilds`, optional `blockExoticSubdeps`, …)
- Printer: `generatePnpmWorkspaceSource()` → `pnpm-workspace.yaml`
- uwebsockets sets `blockExoticSubdeps: false` so git-hosted `uWebSockets.js` can install under pnpm 11+

Bootstrap generation:

- Specs: `HTTP_ADAPTER_BOOTSTRAP_SPECS` — per-adapter imports, options, listen statements
- Model factory: `createBootstrapSourceModel(httpAdapter, dbAdapter)`
- Model: `BootstrapSourceModel` (`imports`, `adapter`, `applicationType`, `listenStatements`, optional container body)
- Printer: `generateBootstrapSource()` → `src/app/scripts/bootstrap.ts`
- Writer: `writeBootstrapSourceFile(projectPath, model)`
- Entry: `generateIndexSource()` → `src/index.ts` uses top-level `await bootstrap()`

TodoController generation:

- Model factory: `createTodoControllerSourceModel(httpAdapter)`
- Model: `TodoControllerSourceModel` (`imports`, `methodCaptureRequestValues`, `methodHeaders`)
- Printer: `generateTodoControllerSource()` → `src/todo/api/controllers/TodoController.ts`
- uwebsockets sets `@CaptureRequestValues` on POST and PATCH only (the endpoints that read the body). Capturing `url` also captures query, which the adapter needs to rebuild the URL. GET and DELETE do not consume the body, so they do not need the decorator.
- uwebsockets sets `@SetHeader('Content-Type', 'application/json')` on JSON-returning endpoints (`POST`, `GET`, `PATCH`). `_replyJson` does not set that header. `DELETE` returns 204 No Content and does not need it.

Generated bootstrap always includes:

1. Non-exported `async initializeContainer(): Promise<Container>` that loads config, `LoggerContainerModule` (ConsoleLogger factory whose `logTypes` come from `LOG_LEVELS`), `PrismaContainerModule` (for `prisma+postgresql`), `StatusContainerModule`, and todo modules
2. Exported `async function bootstrap(): Promise<void>` that builds the selected adapter, registers `SwaggerUiProvider` (`/docs`), installs `OpenApiValidationPipe` + `InversifyValidationErrorFilter`, and listens via the bound logger factory

`@inversifyjs/logger` and `winston` are base dependencies (ConsoleLogger factory bound from `LOG_LEVELS`).
`@inversifyjs/http-core` is a base dependency (for `@Controller` / `@Get` / `@Post` on scaffolded controllers).
`@inversifyjs/http-open-api` is a base dependency (OpenAPI 3.2 decorators + `SwaggerUiProvider` via `/v3Dot2`).
`@inversifyjs/open-api-validation`, `@inversifyjs/http-validation`, `ajv`, and `ajv-formats` are base dependencies (OpenAPI-driven request validation; pipe from `/v3Dot2`).
`@inversifyjs/prisma` is a DB-adapter dependency (binds `PrismaClient` via `PrismaContainerModule`).

Scaffolded `tsconfig.json` enables both `experimentalDecorators` and `emitDecoratorMetadata` (required by `@inversifyjs/http-open-api` schema inference).

`createHttpApp` formats all generated `src/**/*.ts` with Prettier (using the copied project `prettier.config.mjs`) before returning, so the initial commit lands prettier-clean sources without a separate format step.

Listen APIs differ by adapter (Express `app.listen`, Fastify `await app.listen`, Hono `serve`, uWebSockets callback `app.listen`). Keep those differences in `HTTP_ADAPTER_BOOTSTRAP_SPECS`, not in the printer.

To extend bootstrap later (more container modules, pipes, controllers):

1. Add generators for the new source files (like status / todo)
2. Extend `createBootstrapSourceModel` imports + `initializeContainerBodyStatements`
3. Keep printing in `generateBootstrapSource`
4. Avoid forking full file templates per adapter combination

### Status resource layout

```
src/status/
  domain/models/Status.ts
  api/controllers/StatusController.ts
  api/builders/StatusV1FromStatusBuilder.ts
  api/models/StatusV1.ts
  adapter/inversify/containerModules/StatusContainerModule.ts
```

### Todo resource layout (Ports + Adapters)

```
src/common/domain/modules/Builder.ts
src/todo/
  domain/models/Todo.ts
  application/ports/TodoPersistencePort.ts
  application/models/todoPersistencePortIdentifier.ts
  api/controllers/TodoController.ts
  api/builders/TodoV1FromTodoBuilder.ts
  api/models/TodoV1.ts
  api/models/CreateTodoV1RequestBody.ts
  api/models/PaginatedTodosV1Response.ts
  api/models/UpdateTodoV1RequestBody.ts
  adapter/prisma/adapters/PrismaTodoPersistenceAdapter.ts
  adapter/prisma/builders/TodoFromPrismaTodoBuilder.ts
  adapter/inversify/containerModules/TodoContainerModule.ts
  adapter/inversify/containerModules/TodoPrismaContainerModule.ts
```

`TodoPersistencePort` keeps HTTP and application code independent of Prisma so future DB adapters can bind a different implementation.

## Post-scaffold pipeline

Owned by `createHttpCommand` (spinners per step):

1. Create project files (`createHttpApp`)
2. `git init` (soft-fail if git missing)
3. Install with selected package manager (Yarn scaffolds assume Corepack is enabled so `packageManager: yarn@<berry>` is honored)
4. `build` (`tsc`)
5. Initial commit (soft-fail if git identity missing)

Package manager commands: `getInstallCommand` / `getBuildCommand` + `runCommandInvocation`.

## Package name normalization

`resolvePackageName` → `normalizePackageName`:

- lowercase
- invalid npm characters → `-`
- strip leading/trailing separators
- max 214 chars
- fallback `app` if empty

Use `path.isAbsolute` in tests (not `startsWith('/')`).

## Testing

Follow [unit testing guidelines](../../../../../docs/testing/unit-testing.md).

```bash
pnpm run --filter @inversifyjs/create-http test:unit
pnpm run --filter @inversifyjs/create-http test:integration
pnpm run --filter @inversifyjs/create-http lint
pnpm run --filter @inversifyjs/create-http build
```

The `add-resource` skill also has an opt-in Promptfoo evaluation. It creates disposable Express/PostgreSQL apps, runs the skill against a simple resource and a relational aggregate, then inspects the generated files and runs each app's build and lint commands. It is intentionally separate from the normal test suite because it invokes an external coding model.

```bash
pnpm run --filter @inversifyjs/create-http eval:skill:add-resource
```

Important coverage areas:

- Dependency composition includes only the selected adapter (exact versions against a fixture catalog)
- Bootstrap generation (default + extra body statements)
- Generated package.json shape / adapter membership / `packageManager` prefix — not catalog version pins (Renovate owns those)
- Yarn scaffolds write `.yarnrc.yml` (`enableScripts: false`, `nodeLinker: node-modules`), `package.json` `dependenciesMeta` from selected `builtDependencies`, and `packageManager` starts with `yarn@`
- Help text includes citty-defined options (`renderUsage`)
- Generated apps contain identical `add-resource` skills for agents using the shared `.agents` convention and Claude's `.claude` convention
- CLI integration (`createHttpCommand.int.spec.ts`): under `tmp/test/createHttpCommand/{npm|yarn|pnpm}/`, scaffold every HTTP adapter × DB adapter into a per-package-manager monorepo, install dependencies once at that root, then build each member and assert compiled `dist/` outputs exist

## Codecov

Package is registered in root `codecov.yml` as `@inversifyjs/create-http` with path `packages/framework/http/tools/create-http`. Keep `@vitest/coverage-v8` for `test:coverage`.

## Common tasks

### Add a new HTTP adapter option

1. Extend the `HttpAdapter` enum + `HTTP_ADAPTERS`
2. Add versions to catalog `templates/base/package.json`
3. Add entry in `HTTP_ADAPTER_DEPENDENCY_SPECS`
4. Add entry in `HTTP_ADAPTER_BOOTSTRAP_SPECS` (adapter class, options, listen statements)
5. Add compose + bootstrap generation tests (include selected / exclude others)

### Change a scaffolded tooling version

Edit `templates/base/package.json`, `package-managers.json`, or `yarn-berry.json`. Prefer letting Renovate open the PR.

### Local smoke run

```bash
pnpm run --filter @inversifyjs/create-http build
node packages/framework/http/tools/create-http/bin/create-inversify-http.js /tmp/demo-app --pm pnpm --adapter express
```

## Important constraints

- Generated apps use **published** versions (`5.4.8`, etc.), never `workspace:*`
- Express scaffold targets **Express 5** (`@inversifyjs/http-express`), not express-v4
- uWebSockets uses GitHub dependency: `github:uNetworking/uWebSockets.js#v…`
- Hono Node hosting needs `@hono/node-server` in addition to `hono`
- Keep CLI help declarative via citty args
- Prefer composition + source models over combinatorial static templates
