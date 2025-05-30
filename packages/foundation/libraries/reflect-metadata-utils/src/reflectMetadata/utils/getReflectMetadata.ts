// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function getReflectMetadata<TMetadata>(
  target: object,
  metadataKey: unknown,
  key?: string | symbol,
): TMetadata | undefined {
  return Reflect.getMetadata(metadataKey, target, key) as TMetadata | undefined;
}
