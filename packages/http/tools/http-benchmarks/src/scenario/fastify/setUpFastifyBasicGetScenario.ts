import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

async function setUp(): Promise<void> {
  const app: FastifyInstance = fastify();

  app.get('/', (_req: FastifyRequest, reply: FastifyReply) => {
    reply.send('ok');
  });

  await app.listen({ host: '0.0.0.0', port: 3000 });
}

void setUp();
