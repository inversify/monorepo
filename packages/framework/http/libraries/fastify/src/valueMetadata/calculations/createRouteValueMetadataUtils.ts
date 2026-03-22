import { createRouteValueMetadataUtils as coreCreateRouteValueMetadataUtils } from '@inversifyjs/http-core';
import { type FastifyRequest } from 'fastify';

export function createRouteValueMetadataUtils<T>(
  key: string | symbol,
): [
  decorator: (value: T) => MethodDecorator,
  getter: (request: FastifyRequest) => T | undefined,
] {
  return coreCreateRouteValueMetadataUtils<FastifyRequest, T>(key);
}
