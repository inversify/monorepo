import { getReflectMetadata } from './getReflectMetadata';

export function updateReflectMetadata<TMetadata>(
  target: object,
  metadataKey: unknown,
  buildDefaultValue: () => TMetadata,
  callback: (metadata: TMetadata) => TMetadata,
  propertyKey?: string | symbol,
): void {
  const metadata: TMetadata =
    getReflectMetadata(target, metadataKey, propertyKey) ?? buildDefaultValue();

  const updatedMetadata: TMetadata = callback(metadata);

  Reflect.defineMetadata(metadataKey, updatedMetadata, target, propertyKey);
}
