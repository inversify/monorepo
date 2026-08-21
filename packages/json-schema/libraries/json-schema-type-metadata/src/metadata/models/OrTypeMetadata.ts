import { type ManyChildrenTypeMetadata } from './ManyChildrenTypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export type OrTypeMetadata = ManyChildrenTypeMetadata<TypeMetadataKind.or>;
