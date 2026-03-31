export function updateControllerOpenApiMetadataOperationProperty<
  TKey extends keyof TOperationObject,
  TMetadata,
  TOperationObject extends { [K in TKey]?: unknown },
>(
  buildOrGetOperationObject: (
    metadata: TMetadata,
    methodKey: string | symbol,
  ) => TOperationObject,
): (
  value: TOperationObject[TKey],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: TKey,
) => (metadata: TMetadata) => TMetadata {
  return (
      value: TOperationObject[TKey],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      target: Function,
      methodKey: string | symbol,
      propertyKey: TKey,
    ) =>
    (metadata: TMetadata): TMetadata => {
      const operationObject: TOperationObject = buildOrGetOperationObject(
        metadata,
        methodKey,
      );

      if (operationObject[propertyKey] !== undefined) {
        throw new Error(
          `Cannot define ${target.name}.${methodKey.toString()} ${propertyKey.toString()} more than once`,
        );
      }

      operationObject[propertyKey] = value;

      return metadata;
    };
}
