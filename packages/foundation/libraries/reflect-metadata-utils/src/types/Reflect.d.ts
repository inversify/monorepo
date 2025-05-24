import 'reflect-metadata';

declare global {
  namespace Reflect {
    function getMetadata(
      metadataKey: unknown,
      target: object,
      propertyKey?: string | symbol,
    ): unknown;

    function getOwnMetadata(
      metadataKey: unknown,
      target: object,
      propertyKey?: string | symbol,
    ): unknown;

    function defineMetadata(
      metadataKey: unknown,
      metadataValue: unknown,
      target: object,
      propertyKey?: string | symbol,
    ): void;
  }
}
