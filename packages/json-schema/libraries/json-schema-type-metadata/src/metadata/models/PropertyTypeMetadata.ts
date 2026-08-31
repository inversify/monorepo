import { type OneChildTypeMetadata } from './OneChildTypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export interface PropertyTypeMetadata extends OneChildTypeMetadata<TypeMetadataKind.propertyType> {
  isOptional: boolean;
  property: string;
}
