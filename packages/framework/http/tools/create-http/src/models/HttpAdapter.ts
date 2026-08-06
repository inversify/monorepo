export type HttpAdapter = 'express' | 'fastify' | 'hono' | 'uwebsockets';

export const HTTP_ADAPTERS: readonly HttpAdapter[] = [
  'express',
  'fastify',
  'hono',
  'uwebsockets',
];
