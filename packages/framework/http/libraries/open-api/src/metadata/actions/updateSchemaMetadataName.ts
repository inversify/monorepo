import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';

export function updateSchemaMetadataName(
  options: SchemaDecoratorOptions | undefined,
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

    return metadata;
  };
}
