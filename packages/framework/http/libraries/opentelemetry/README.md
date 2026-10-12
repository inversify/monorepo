[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhttp-opentelemetry)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhttp-opentelemetry)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Fhttp%2Flibraries%2Fopentelemetry%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/http-opentelemetry)

# @inversifyjs/http-opentelemetry

OpenTelemetry sink for InversifyJS HTTP instrumentation events. Register an OpenTelemetry SDK in the application, then pass the sink to an HTTP adapter:

```typescript
import { createHttpOpenTelemetrySink } from '@inversifyjs/http-opentelemetry';

const adapter = new InversifyExpressHttpAdapter(container, {
  instrumentation: [createHttpOpenTelemetrySink()],
});
```
