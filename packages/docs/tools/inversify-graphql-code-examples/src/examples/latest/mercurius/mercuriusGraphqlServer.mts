import fastify, { FastifyInstance } from 'fastify';
import mercurius from 'mercurius';

const app: FastifyInstance = fastify();

const schema: string = `
  type Query {
    add(x: Int, y: Int): Int
  }
`;

const resolvers: mercurius.IResolvers<unknown, mercurius.MercuriusContext> = {
  Query: {
    add: async (_: unknown, { x, y }: { x: number; y: number }) => x + y,
  },
};

app.register(mercurius, {
  resolvers,
  schema,
});

await app.listen({ port: 3000 });
