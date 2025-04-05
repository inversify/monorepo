[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Finterceptor)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Finterceptor)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fcontainer%2Flibraries%2Finterceptor%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/interceptor)

# @inversifyjs/interceptor

InversifyJS interceptor modules for extending Container functionality.

## Installation

```sh
npm install @inversifyjs/interceptor
```

## Usage

```typescript
import { Container } from '@inversifyjs/container';
import { createPlanningInterceptorV1 } from '@inversifyjs/interceptor';

const container = new Container();

// Create an interceptor that logs planning operations
const loggingInterceptor = createPlanningInterceptorV1((params, next) => {
  console.log('Planning:', params.rootConstraints.serviceIdentifier);
  const result = next(params);
  console.log('Plan completed');
  return result;
});

// Register the interceptor with the container
container.use(loggingInterceptor);
```

## License

MIT 