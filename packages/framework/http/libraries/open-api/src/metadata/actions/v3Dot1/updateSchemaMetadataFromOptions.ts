import { type OasSchemaDecoratorOptions } from '../../models/v3Dot1/OasSchemaDecoratorOptions.js';
import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';

export function updateSchemaMetadataFromOptions(
  options: OasSchemaDecoratorOptions | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): (metadata: OpenApiSchemaMetadata) => OpenApiSchemaMetadata {
  return (metadata: OpenApiSchemaMetadata): OpenApiSchemaMetadata => {
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
