import { type BaseTypeMetadata } from './BaseTypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export type IntegerTypeMetadata =
  BaseTypeMetadata<TypeMetadataKind.integerType>;
