import { routeValueMetadata } from '../../http/decorators/routeValueMetadata.js';
import { routeValueMetadataSymbol } from '../../http/models/routeValueMetadataSymbol.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function createRouteValueMetadataUtils<TRequest, T>(
  key: string | symbol,
): [
  decorator: (value: T) => MethodDecorator,
  getter: (request: TRequest) => T | undefined,
] {
  const decorator: (value: T) => MethodDecorator = (
    value: T,
  ): MethodDecorator => routeValueMetadata(key, value);

  const getter: (request: TRequest) => T | undefined = (
    request: TRequest,
  ): T | undefined => {
    const routeValueMetadataMap: Map<string | symbol, unknown> | undefined = (
      request as TRequest & {
        [routeValueMetadataSymbol]?: Map<string | symbol, unknown>;
      }
    )[routeValueMetadataSymbol];

    return routeValueMetadataMap?.get(key) as T | undefined;
  };

  return [decorator, getter];
}
