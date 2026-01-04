/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type http from 'node:http';

import {
  type InversifyApolloProvider,
  inversifyApolloProviderServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { ApolloExpressServerContainerModule } from '@inversifyjs/apollo-express';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Container, inject, injectable } from 'inversify';

// Begin-example
@injectable()
class QueryResolvers {
  public hello(): string {
    return 'Hello World!';
  }
}

@injectable()
class AppResolvers {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public readonly Query: QueryResolvers;

  constructor(@inject(QueryResolvers) queryResolvers: QueryResolvers) {
    this.Query = queryResolvers;
  }
}

const typeDefs: string = `
  type Query {
    hello: String
  }
`;

const container: Container = new Container();

await container.load(
  ApolloExpressServerContainerModule.graphServerFromOptions(
    {
      controllerOptions: {
        path: '/graphql',
      },
      getContext: async () => ({}),
    },
    {
      resolverServiceIdentifier: AppResolvers,
      typeDefs,
    },
  ),
);

container.bind(QueryResolvers).toSelf();
container.bind(AppResolvers).toSelf();

const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
  container,
);
await adapter.build();

const inversifyApolloProvider: InversifyApolloProvider<http.Server> =
  await container.getAsync(inversifyApolloProviderServiceIdentifier);

await new Promise<void>((resolve: () => void) => {
  inversifyApolloProvider.server.listen(3000, () => {
    resolve();
  });
});

console.log(`Server is running on http://localhost:3000`);
// End-example
