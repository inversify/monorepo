export function setRouteValueMetadata(
  propertyKey: string | symbol,
  metadataKey: string | symbol,
  value: unknown,
): (
  metadata: Map<string | symbol, Map<string | symbol, unknown>>,
) => Map<string | symbol, Map<string | symbol, unknown>> {
  return (
    metadata: Map<string | symbol, Map<string | symbol, unknown>>,
  ): Map<string | symbol, Map<string | symbol, unknown>> => {
    let methodMetadata: Map<string | symbol, unknown> | undefined =
      metadata.get(propertyKey);

    if (methodMetadata === undefined) {
      methodMetadata = new Map<string | symbol, unknown>();
      metadata.set(propertyKey, methodMetadata);
    }

    methodMetadata.set(metadataKey, value);

    return metadata;
  };
}
