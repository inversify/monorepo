import { createRouteValueMetadataUtils as coreCreateRouteValueMetadataUtils } from '@inversifyjs/http-core';
import type { HonoRequest } from 'hono';

export function createRouteValueMetadataUtils<T>(
  key: string | symbol,
): [
  decorator: (value: T) => (value: Function, context: ClassMethodDecoratorContext) => void,
  getter: (request: HonoRequest) => T | undefined,
] {
  return coreCreateRouteValueMetadataUtils<HonoRequest, T>(key);
}
