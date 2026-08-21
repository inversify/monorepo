import { type TypeMetadataKind } from './TypeMetadataKind.js';

export interface BaseTypeMetadata<TKind extends TypeMetadataKind> {
  id?: string;
  kind: TKind;
}
