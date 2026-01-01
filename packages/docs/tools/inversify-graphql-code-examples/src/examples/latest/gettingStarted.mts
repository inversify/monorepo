// Shift-line-spaces-2
import { ApolloExpressServerContainerModule } from '@inversifyjs/apollo-express';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Container, inject, injectable } from 'inversify';

void (async () => {
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
  // End-example
})();
