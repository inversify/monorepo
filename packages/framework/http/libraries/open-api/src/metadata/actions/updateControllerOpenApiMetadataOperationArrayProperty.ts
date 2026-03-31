import { type ArrayValue } from '../../common/models/ArrayValue.js';

export function updateControllerOpenApiMetadataOperationArrayProperty<
  TKey extends keyof TOperationObject,
  TMetadata,
  TOperationObject extends { [K in TKey]?: unknown[] | undefined },
>(
  buildOrGetOperationObject: (
    metadata: TMetadata,
    methodKey: string | symbol,
  ) => TOperationObject,
): (
  value: ArrayValue<TOperationObject[TKey]>,
  methodKey: string | symbol,
  propertyKey: TKey,
) => (metadata: TMetadata) => TMetadata {
  return (
      value: ArrayValue<TOperationObject[TKey]>,
      methodKey: string | symbol,
      propertyKey: TKey,
    ) =>
    (metadata: TMetadata): TMetadata => {
      const operationObject: TOperationObject = buildOrGetOperationObject(
        metadata,
        methodKey,
      );

      if (operationObject[propertyKey] === undefined) {
        operationObject[propertyKey] = [] as unknown as TOperationObject[TKey];
      }

      (
        operationObject[propertyKey] as ArrayValue<TOperationObject[TKey]>[]
      ).push(value);

      return metadata;
    };
}
