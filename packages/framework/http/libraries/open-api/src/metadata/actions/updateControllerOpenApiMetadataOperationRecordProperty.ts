import { type StringRecordValue } from '../../common/models/StringRecordValue.js';

export function updateControllerOpenApiMetadataOperationRecordProperty<
  TKey extends keyof TOperationObject,
  TMetadata,
  TOperationObject extends {
    [K in TKey]?: Record<string | symbol, unknown> | undefined;
  },
>(
  buildOrGetOperationObject: (
    metadata: TMetadata,
    methodKey: string | symbol,
  ) => TOperationObject,
): (
  key: string,
  value: StringRecordValue<TOperationObject[TKey]>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: TKey,
) => (metadata: TMetadata) => TMetadata {
  return (
      key: string,
      value: StringRecordValue<TOperationObject[TKey]>,
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

      if (operationObject[propertyKey] === undefined) {
        operationObject[propertyKey] = {} as unknown as TOperationObject[TKey];
      }

      if (
        (
          operationObject[propertyKey] as Record<
            string,
            StringRecordValue<TOperationObject[TKey]>
          >
        )[key] !== undefined
      ) {
        throw new Error(
          `Cannot define ${target.name}.${methodKey.toString()} ${propertyKey.toString()} (${key}) more than once`,
        );
      }

      (
        operationObject[propertyKey] as Record<
          string,
          StringRecordValue<TOperationObject[TKey]>
        >
      )[key] = value;

      return metadata;
    };
}
