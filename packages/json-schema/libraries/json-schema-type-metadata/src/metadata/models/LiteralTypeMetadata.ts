import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type BaseTypeMetadata } from './BaseTypeMetadata.js';
import { type TypeMetadataKind } from './TypeMetadataKind.js';

export interface LiteralTypeMetadata extends BaseTypeMetadata<TypeMetadataKind.literalType> {
  literal: JsonValue;
}
