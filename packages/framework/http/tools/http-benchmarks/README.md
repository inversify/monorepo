# @inversifyjs/http-benchmarks

Inversify HTTP benchmars package.

## Running scenarios

[Grafana K6](https://grafana.com/docs/k6/latest/set-up/install-k6/) is required to run http benchmarks.

## Adding scenarios

1. Base scenarios must be located at `src/k6/scenario`.
2. Specific scenario setup files must be named `setup.ts`. For example `express` basic get scenario is placed at `src/scenario/express/setup.ts`.
