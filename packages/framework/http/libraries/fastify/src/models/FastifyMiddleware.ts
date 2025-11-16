import { Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';

export type FastifyMiddleware = Middleware<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
>;
