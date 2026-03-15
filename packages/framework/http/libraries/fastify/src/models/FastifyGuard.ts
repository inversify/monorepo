import { type Guard } from '@inversifyjs/http-core';
import { type FastifyRequest } from 'fastify';

export type FastifyGuard = Guard<FastifyRequest>;
