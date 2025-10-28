import { ErrorFilter } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';

export type FastifyErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  FastifyRequest,
  FastifyReply,
  void
>;
