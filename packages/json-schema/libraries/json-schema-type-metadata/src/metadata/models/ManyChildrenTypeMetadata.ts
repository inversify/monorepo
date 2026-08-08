import { type BaseTypeMetadata } from './BaseTypeMetadata.js';
import { type TypeMetadata } from './TypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export interface ManyChildrenTypeMetadata<
  TKind extends TypeMetadataKind,
  TChildren extends TypeMetadata[] = TypeMetadata[],
> extends BaseTypeMetadata<TKind> {
  children: TChildren;
}
