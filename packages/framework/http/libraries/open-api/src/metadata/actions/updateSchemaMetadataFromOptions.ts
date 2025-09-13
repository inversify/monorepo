import { OasSchemaDecoratorOptions } from '../models/OasSchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';

export function updateSchemaMetadataFromOptions(
  options: OasSchemaDecoratorOptions | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): (metadata: SchemaMetadata) => SchemaMetadata {
  return (metadata: SchemaMetadata): SchemaMetadata => {
    if (options?.name !== undefined) {
      if (metadata.name !== undefined) {
        throw new Error(`Cannot redefine "${target.name}" schema name`);
      }

      metadata.name = options.name;
    }

    if (options?.customAttributes !== undefined) {
      if (metadata.customAttributes === undefined) {
        metadata.customAttributes = {};
      }

      Object.assign(metadata.customAttributes, options.customAttributes);
    }

    return metadata;
  };
}
