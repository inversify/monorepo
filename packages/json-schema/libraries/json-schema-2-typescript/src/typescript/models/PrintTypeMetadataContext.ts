import { type TypeMetadata } from '@inversifyjs/json-schema-type-metadata';

export interface PrintTypeMetadataContext {
  typeMetadataToNameMap: Map<TypeMetadata, string>;
}
