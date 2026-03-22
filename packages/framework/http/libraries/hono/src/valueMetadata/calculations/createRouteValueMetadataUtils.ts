import {
  routeValueMetadata,
  routeValueMetadataSymbol,
} from '@inversifyjs/http-core';
import type { Context } from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    [routeValueMetadataSymbol]: Map<string | symbol, unknown>;
  }
}

export function createRouteValueMetadataUtils<T>(
  key: string | symbol,
): [
  decorator: (value: T) => MethodDecorator,
  getter: (context: Context) => T | undefined,
] {
  const decorator: (value: T) => MethodDecorator = (
    value: T,
  ): MethodDecorator => routeValueMetadata(key, value);

  const getter: (context: Context) => T | undefined = (
    context: Context,
  ): T | undefined => {
    const routeValueMetadataMap: Map<string | symbol, unknown> | undefined =
      context.get(routeValueMetadataSymbol) as
        | Map<string | symbol, unknown>
        | undefined;

    return routeValueMetadataMap === undefined
      ? undefined
      : (routeValueMetadataMap.get(key) as T | undefined);
  };

  return [decorator, getter];
}
