import { type OneChildTypeMetadata } from './OneChildTypeMetadata.js';
import { type TypeMetadata } from './TypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export interface ArrayTypeMetadata extends OneChildTypeMetadata<TypeMetadataKind.arrayType> {
  prefixItems?: TypeMetadata[];
}
