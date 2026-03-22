import { createRouteValueMetadataUtils as coreCreateRouteValueMetadataUtils } from '@inversifyjs/http-core';
import { type HttpRequest } from 'uWebSockets.js';

export function createRouteValueMetadataUtils<T>(
  key: string | symbol,
): [
  decorator: (value: T) => MethodDecorator,
  getter: (request: HttpRequest) => T | undefined,
] {
  return coreCreateRouteValueMetadataUtils<HttpRequest, T>(key);
}
