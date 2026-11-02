// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function getReflectMetadata<TMetadata>(
  target: object,
  metadataKey: unknown,
  propertyKey?: string | symbol,
): TMetadata | undefined {
  return Reflect.getMetadata(metadataKey, target, propertyKey) as
    | TMetadata
    | undefined;
}
