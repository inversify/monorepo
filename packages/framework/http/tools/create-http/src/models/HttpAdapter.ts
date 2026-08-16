export enum HttpAdapter {
  express = 'express',
  fastify = 'fastify',
  hono = 'hono',
  uwebsockets = 'uwebsockets',
}

export const HTTP_ADAPTERS: readonly HttpAdapter[] = [
  HttpAdapter.express,
  HttpAdapter.fastify,
  HttpAdapter.hono,
  HttpAdapter.uwebsockets,
];
