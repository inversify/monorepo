[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fgrpc-js)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fgrpc-js)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Fgrpc%2Flibraries%2Fgrpc-js%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/grpc-js)

# @inversifyjs/grpc-js

gRPC server adapter for [`@grpc/grpc-js`](https://www.npmjs.com/package/@grpc/grpc-js). `InversifyGrpcJsAdapter` extends `InversifyGrpcAdapter` from `@inversifyjs/grpc-core`: `build()` registers each bound `@Service` on a `Server`. Bind the address on the server `build()` returns.

`@grpc/grpc-js` is a peer dependency, together with `inversify`.

Unary and client-streaming methods that return a message are sent with the grpc-js callback, so interceptor transforms reach the client. Server-streaming and bidirectional methods write to the call. A `GrpcError`, a guard that returns `false`, or an error with no matching filter ends the call with that status: through the callback when the RPC has one, and by emitting `error` on the call when it does not.

`heroServiceDefinition` below is the service object from `@grpc/proto-loader`, or the same shape from generated code. `@RPC('GetHero')` is the key on that object.

```ts
import { ServerCredentials, type Server } from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';
import { InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { Container } from 'inversify';

@Service(heroServiceDefinition)
class HeroService {
  @RPC('GetHero')
  public getHero(call: { request: { id: string } }): { name: string } {
    return { name: call.request.id };
  }
}

const container: Container = new Container();

container.bind(HeroService).toSelf();

const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(container, {
  logger: true,
  serverOptions: {
    'grpc.max_concurrent_streams': 100,
  },
});
const server: Server = await adapter.build();

await new Promise<void>(
  (resolve: () => void, reject: (error: Error) => void): void => {
    server.bindAsync(
      '0.0.0.0:50051',
      ServerCredentials.createInsecure(),
      (error: Error | null): void => {
        if (error === null) {
          resolve();
        } else {
          reject(error);
        }
      },
    );
  },
);
```

Pass an existing `Server` as the third argument when the process already created one. `serverOptions` apply only when this adapter constructs the server.
