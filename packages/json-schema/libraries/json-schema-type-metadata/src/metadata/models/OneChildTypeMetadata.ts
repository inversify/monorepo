import { type BaseTypeMetadata } from './BaseTypeMetadata.js';
import { type TypeMetadata } from './TypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export interface OneChildTypeMetadata<
  TKind extends TypeMetadataKind,
> extends BaseTypeMetadata<TKind> {
  child: TypeMetadata;
}
