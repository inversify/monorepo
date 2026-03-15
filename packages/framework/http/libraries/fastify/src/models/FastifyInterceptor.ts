import { type Interceptor } from '@inversifyjs/http-core';
import { type FastifyReply, type FastifyRequest } from 'fastify';

export type FastifyInterceptor = Interceptor<FastifyRequest, FastifyReply>;
