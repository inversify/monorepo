import { createRouteValueMetadataUtils as coreCreateRouteValueMetadataUtils } from '@inversifyjs/http-core';
import { type Request } from 'express';

export function createRouteValueMetadataUtils<T>(
  key: string | symbol,
): [
  decorator: (value: T) => (value: Function, context: ClassMethodDecoratorContext) => void,
  getter: (request: Request) => T | undefined,
] {
  return coreCreateRouteValueMetadataUtils<Request, T>(key);
}
