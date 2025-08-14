import { Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

export type FastifyMiddleware = Middleware<
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
  void
>;
