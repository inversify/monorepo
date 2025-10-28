import { Interceptor } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';

export type FastifyInterceptor = Interceptor<FastifyRequest, FastifyReply>;
