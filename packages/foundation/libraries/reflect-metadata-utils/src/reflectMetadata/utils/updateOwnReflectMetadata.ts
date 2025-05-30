import { getOwnReflectMetadata } from './getOwnReflectMetadata';

export function updateOwnReflectMetadata<TMetadata>(
  target: object,
  metadataKey: unknown,
  buildDefaultValue: () => TMetadata,
  callback: (metadata: TMetadata) => TMetadata,
  propertyKey?: string | symbol,
): void {
  const metadata: TMetadata =
    getOwnReflectMetadata(target, metadataKey, propertyKey) ??
    buildDefaultValue();

  const updatedMetadata: TMetadata = callback(metadata);

  Reflect.defineMetadata(metadataKey, updatedMetadata, target, propertyKey);
}
