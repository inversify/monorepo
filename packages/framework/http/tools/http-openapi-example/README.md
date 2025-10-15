# @inversifyjs/http-openapi-example

Example HTTP backend using InversifyJS, Express, and the OpenAPI tooling.

This package spins up an Express server wired with Inversify, and serves a Swagger UI plus an OpenAPI spec endpoint.

## Prerequisites

- Node.js: 24.x
- pnpm: 10.x

## Setup

You can run from the repo root or from this package folder.

From this folder:

1) Install dependencies

  pnpm install

2) Build the example

  pnpm run build

3) Start the server

  pnpm run serve

The server listens on http://localhost:3000

## API documentation

- Swagger UI: http://localhost:3000/docs
- OpenAPI spec (JSON): http://localhost:3000/docs/spec

## Notes

- A lightweight LMDB store is used for persistence under the local `my-db/` directory.
- Scripts available:
  - build: builds ESM output under `lib/esm`.
  - serve: runs `node lib/esm/index.js`.
