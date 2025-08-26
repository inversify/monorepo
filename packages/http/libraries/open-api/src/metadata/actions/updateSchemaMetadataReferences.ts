import { SchemaMetadata } from '../models/SchemaMetadata';

export function updateSchemaMetadataReferences(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): (metadata: SchemaMetadata) => SchemaMetadata {
  return (metadata: SchemaMetadata): SchemaMetadata => {
    metadata.references.set(name, type);

    return metadata;
  };
}
