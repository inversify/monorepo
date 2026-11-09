---
title: Create your first Inversify HTTP API
published: false
description: Scaffold a working Inversify HTTP API with one command, then explore its OpenAPI docs, todos, and request timeline.
tags: typescript, node, webdev, tutorial
cover_image: https://inversify.io/framework/img/create-app-cover.png
canonical_url: https://inversify.io/framework/blog/create-your-first-http-api
---

A running API is the fastest way to see what Inversify HTTP feels like. The scaffolded API already has controllers, request validation, OpenAPI docs, and a Postgres-backed todo list, so you can try a real project before you decide how to shape your own.

<video controls playsinline poster="https://inversify.io/framework/img/create-app-cover.png" preload="none" width="100%">
  <source src="https://inversify.io/framework/video/create-app.mp4" type="video/mp4" />
  <a href="https://inversify.io/framework/blog/create-your-first-http-api">Watch the scaffold walkthrough</a>
</video>

## Start with one command

[`@inversifyjs/create-http`](https://www.npmjs.com/package/@inversifyjs/create-http) asks for a package manager, an HTTP adapter, and an API style. It writes the project, installs the dependencies, and builds it.

```bash
npm create @inversifyjs/http@latest my-app
```

```bash
pnpm create @inversifyjs/http my-app
```

```bash
yarn create @inversifyjs/http my-app
```

The prompts accept `npm`, `pnpm`, or `yarn`, an adapter (`express`, `fastify`, `hono`, or `uwebsockets`), and an API style (`code-first` or `schema-first`). Pass `--pm`, `--adapter`, and `--apiStyle` when you already know the answers. Yarn projects use Yarn Berry, so run `corepack enable` once before the create command.

## Run the sample

Todos live in PostgreSQL. Start the database from the generated `docker-compose.yml`, apply the migrations, and serve the API. Use the script names that match the package manager you picked (`npm run`, `pnpm`, or `yarn`).

```bash
cd my-app
docker compose up -d
npm run db:migrate
npm run serve
```

Then open:

- [http://localhost:3000/docs](http://localhost:3000/docs) for the OpenAPI UI
- [http://localhost:3000/v1/status](http://localhost:3000/v1/status) to check that the server is up
- [http://localhost:3000/v1/todos](http://localhost:3000/v1/todos) for the todo API

The generated `.env` sets `DEV_PROFILER_ENABLED=true`. With that flag on, the same server records each call and serves [HTTP Insights](https://inversify.io/framework/docs/ecosystem/http-insights) at [http://localhost:3000/.inversify/http-insights-ui](http://localhost:3000/.inversify/http-insights-ui). Send a few requests from the docs UI and open a call to see the middleware, the validation pipe, and the controller on one timeline.

## Where to go next

The [getting started guide](https://inversify.io/framework/docs/introduction/getting-started) walks through the scaffold, then shows how to add the packages to a project you already have. [Controllers](https://inversify.io/framework/docs/fundamentals/controller) are the next page after that.

---

Stuck on the generated project? Open an issue on [GitHub](https://github.com/inversify/monorepo) or ask in [Discord](https://discord.gg/jXcMagAPnm).
