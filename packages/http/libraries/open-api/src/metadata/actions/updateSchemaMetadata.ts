import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';

export function updateSchemaMetadata(
  schema: OpenApi3Dot1SchemaObject | undefined,
  options: SchemaDecoratorOptions | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): (metadata: SchemaMetadata) => SchemaMetadata {
  return (metadata: SchemaMetadata): SchemaMetadata => {
    metadata.schema = schema;

    if (options?.name !== undefined) {
      if (metadata.name !== undefined) {
        throw new Error(`Cannot redefine "${target.name}" schema name`);
      }

      metadata.name = options.name;
    }

    return metadata;
  };
}
