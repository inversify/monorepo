import { type ErrorFilter } from '@inversifyjs/http-core';
import { type FastifyReply, type FastifyRequest } from 'fastify';

export type FastifyErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  FastifyRequest,
  FastifyReply,
  void
>;
