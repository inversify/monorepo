import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { DEFAULT_PORT } from '../../constant/defaultPort';

async function setUp(): Promise<void> {
  const app: FastifyInstance = fastify();

  app.get('/', (_req: FastifyRequest, reply: FastifyReply) => {
    reply.send('ok');
  });

  await app.listen({ host: '0.0.0.0', port: DEFAULT_PORT });
}

void setUp();
