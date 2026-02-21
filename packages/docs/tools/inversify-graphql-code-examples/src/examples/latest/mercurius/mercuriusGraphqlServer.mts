import fastify, { type FastifyInstance } from 'fastify';
import mercurius, { type IResolvers, type MercuriusContext } from 'mercurius';

const app: FastifyInstance = fastify();

const schema: string = `
  type Query {
    add(x: Int, y: Int): Int
  }
`;

const resolvers: IResolvers<unknown, MercuriusContext> = {
  Query: {
    add: async (_: unknown, { x, y }: { x: number; y: number }) => x + y,
  },
};

app.register(mercurius, {
  resolvers,
  schema,
});

await app.listen({ port: 3000 });
