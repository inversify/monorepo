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

Planned extensions (same patterns): DB layer (Prisma), validators, OpenAPI, auth.

## Architecture

```
Recipe (CLI args / prompts)
        │
        ▼
┌───────────────────┐
│ createHttpApp     │  orchestrates file generation
└─────────┬─────────┘
          │
          ├─ composeScaffoldDependencies(catalog, adapter)
          │     └─ writes package.json (only selected deps)
          │
          ├─ copy static templates (tsconfig, eslint, prettier, gitignore, …)
          │
          ├─ generateIndexSource() → src/index.ts
          ├─ writeStatusSourceFiles() → status model, controller, container module
          │
          └─ writeBootstrapSourceFile(createBootstrapSourceModel(adapter))
                └─ ts-morph from BootstrapSourceModel
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
| `src/models/` | Shared types (`HttpAdapter`, `PackageManager`, options) |
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

`templates/base/package-managers.json` pins `npm` / `pnpm` / `yarn` versions for the generated `packageManager` field (jsonata custom manager in renovate config).

### Recipe specs

`src/dependencies/models/HttpAdapterDependencySpecs.ts`:

- `BASE_DEPENDENCY_NAMES` / `BASE_DEV_DEPENDENCY_NAMES` — always installed
- `HTTP_ADAPTER_DEPENDENCY_SPECS` — per-adapter package **names** only

`composeScaffoldDependencies(catalog, httpAdapter)` picks catalog versions for base + selected adapter only.

### Adding a new optional feature (e.g. Prisma, validator)

1. Add package versions to `templates/base/package.json` (catalog)
2. Add a feature/adapter spec listing package names (like `HTTP_ADAPTER_DEPENDENCY_SPECS`)
3. Extend the recipe / CLI option
4. Call composition when building generated `package.json`
5. Add unit tests that assert **included** and **excluded** packages

Never hardcode versions in TypeScript source — Renovate would miss them.

## Templates vs generated code

### Static templates (`templates/base/`)

Copied (sometimes renamed) into the target app:

| Template | Generated path | Notes |
|---|---|---|
| `.gitignore` | `.gitignore` | Covers npm/yarn/pnpm caches & logs |
| `tsconfig.json` | `tsconfig.json` | Strict options; `src` → `dist` |
| `eslint.config.mjs.template` | `eslint.config.mjs` | **Must** use `.template` suffix in repo |
| `prettier.config.mjs.template` | `prettier.config.mjs` | Same rename pattern |
| `package.json` | _(not copied)_ | Catalog only |
| `package-managers.json` | _(not copied)_ | Catalog only |

Generated (not copied from templates):

| Generated path | Source |
|---|---|
| `src/index.ts` | `generateIndexSource()` — top-level `await bootstrap()` |
| `src/app/scripts/bootstrap.ts` | `generateBootstrapSource(createBootstrapSourceModel(adapter))` |
| `src/status/models/StatusResponse.ts` | `generateStatusResponseSource()` |
| `src/status/controllers/StatusController.ts` | `generateStatusControllerSource()` — `GET /status` → `{ status: 'ok' }` |
| `src/status/containerModules/StatusContainerModule.ts` | `generateStatusContainerModuleSource()` — binds controller singleton |

**Why `.template` for eslint/prettier configs?**  
ESLint flat config loads the nearest `eslint.config.*`. If the template keeps a real `eslint.config.mjs` under `templates/`, lint-staged/ESLint will try to load it (and fail — `@eslint/js` is not installed there). Rename on copy.

This package's own `eslint.config.mjs` also `ignores: ['templates/**']`, and `.lintstagedrc.json` only lints `src/**/*.ts`.

### Programmatic generation (ts-morph)

Variable TypeScript (decorators, DI wiring, adapters) should be generated from a **source model**, not string templates with `if`s.

Bootstrap generation:

- Specs: `HTTP_ADAPTER_BOOTSTRAP_SPECS` — per-adapter imports, options, listen statements
- Model factory: `createBootstrapSourceModel(httpAdapter)`
- Model: `BootstrapSourceModel` (`imports`, `adapter`, `applicationType`, `listenStatements`, optional container body)
- Printer: `generateBootstrapSource()` → `src/app/scripts/bootstrap.ts`
- Writer: `writeBootstrapSourceFile(projectPath, model)`
- Entry: `generateIndexSource()` → `src/index.ts` uses top-level `await bootstrap()`

Generated bootstrap always includes:

1. Non-exported `initializeContainer(): Container` that `container.load(new StatusContainerModule())`
2. Exported `async function bootstrap(): Promise<void>` that builds the selected adapter and listens

`@inversifyjs/http-core` is a base dependency (for `@Controller` / `@Get` on scaffolded controllers).

Listen APIs differ by adapter (Express `app.listen`, Fastify `await app.listen`, Hono `serve`, uWebSockets callback `app.listen`). Keep those differences in `HTTP_ADAPTER_BOOTSTRAP_SPECS`, not in the printer.

To extend bootstrap later (more container modules, pipes, controllers):

1. Add generators for the new source files (like status)
2. Extend `createBootstrapSourceModel` imports + `initializeContainerBodyStatements`
3. Keep printing in `generateBootstrapSource`
4. Avoid forking full file templates per adapter combination

## Post-scaffold pipeline

Owned by `createHttpCommand` (spinners per step):

1. Create project files (`createHttpApp`)
2. `git init` (soft-fail if git missing)
3. Install with selected package manager
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
pnpm run --filter @inversifyjs/create-http lint
pnpm run --filter @inversifyjs/create-http build
```

Important coverage areas:

- Dependency composition includes only the selected adapter (exact versions against a fixture catalog)
- Bootstrap generation (default + extra body statements)
- Generated package.json shape / adapter membership / `packageManager` prefix — not catalog version pins (Renovate owns those)
- Help text includes citty-defined options (`renderUsage`)

## Codecov

Package is registered in root `codecov.yml` as `@inversifyjs/create-http` with path `packages/framework/http/tools/create-http`. Keep `@vitest/coverage-v8` for `test:coverage`.

## Common tasks

### Add a new HTTP adapter option

1. Extend `HttpAdapter` + `HTTP_ADAPTERS`
2. Add versions to catalog `templates/base/package.json`
3. Add entry in `HTTP_ADAPTER_DEPENDENCY_SPECS`
4. Add entry in `HTTP_ADAPTER_BOOTSTRAP_SPECS` (adapter class, options, listen statements)
5. Add compose + bootstrap generation tests (include selected / exclude others)

### Change a scaffolded tooling version

Edit `templates/base/package.json` (or `package-managers.json`). Prefer letting Renovate open the PR.

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
