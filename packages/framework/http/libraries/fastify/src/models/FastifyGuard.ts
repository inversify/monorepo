import { Guard } from '@inversifyjs/http-core';
import { FastifyRequest } from 'fastify';

export type FastifyGuard = Guard<FastifyRequest>;
