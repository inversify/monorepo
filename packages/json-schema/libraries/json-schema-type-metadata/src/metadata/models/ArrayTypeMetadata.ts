import { type OneChildTypeMetadata } from './OneChildTypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export type ArrayTypeMetadata =
  OneChildTypeMetadata<TypeMetadataKind.arrayType>;
