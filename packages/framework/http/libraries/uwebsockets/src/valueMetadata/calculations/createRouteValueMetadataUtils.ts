import { createRouteValueMetadataUtils as coreCreateRouteValueMetadataUtils } from '@inversifyjs/http-core';
import { type HttpRequest } from 'uWebSockets.js';

export function createRouteValueMetadataUtils<T>(
  key: string | symbol,
): [
  decorator: (value: T) => (value: Function, context: ClassMethodDecoratorContext) => void,
  getter: (request: HttpRequest) => T | undefined,
] {
  return coreCreateRouteValueMetadataUtils<HttpRequest, T>(key);
}
