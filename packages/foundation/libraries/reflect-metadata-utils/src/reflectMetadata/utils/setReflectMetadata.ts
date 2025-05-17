export function setReflectMetadata(
  target: object,
  metadataKey: unknown,
  metadata: unknown,
  propertyKey?: string | symbol,
): void {
  Reflect.defineMetadata(metadataKey, metadata, target, propertyKey);
}
