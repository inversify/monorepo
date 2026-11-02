// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function getOwnReflectMetadata<TMetadata>(
  target: object,
  metadataKey: unknown,
  propertyKey?: string | symbol,
): TMetadata | undefined {
  return Reflect.getOwnMetadata(metadataKey, target, propertyKey) as
    | TMetadata
    | undefined;
}
