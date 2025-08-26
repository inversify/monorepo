import { SchemaReferencesMetadata } from '../models/SchemaReferencesMetadata';

export function updateSchemaMetadataReferences<
  TMetadata extends SchemaReferencesMetadata,
>(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): (metadata: TMetadata) => TMetadata {
  return (metadata: TMetadata): TMetadata => {
    metadata.references.set(name, type);

    return metadata;
  };
}
