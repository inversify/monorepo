import { type Middleware } from '@inversifyjs/http-core';
import { type FastifyReply, type FastifyRequest } from 'fastify';

export type FastifyMiddleware = Middleware<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
>;
