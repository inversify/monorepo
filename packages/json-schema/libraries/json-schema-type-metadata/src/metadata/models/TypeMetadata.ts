import { type AndTypeMetadata } from './AndTypeMetadata.js';
import { type AnyTypeMetadata } from './AnyTypeMetadata.js';
import { type ArrayTypeMetadata } from './ArrayTypeMetadata.js';
import { type BooleanTypeMetadata } from './BooleanTypeMetadata.js';
import { type FloatTypeMetadata } from './FloatTypeMetadata.js';
import { type IntegerTypeMetadata } from './IntegerTypeMetadata.js';
import { type LiteralTypeMetadata } from './LiteralTypeMetadata.js';
import { type NoneTypeMetadata } from './NoneTypeMetadata.js';
import { type ObjectTypeMetadata } from './ObjectTypeMetadata.js';
import { type OrTypeMetadata } from './OrTypeMetadata.js';
import { type PropertyTypeMetadata } from './PropertyTypeMetadata.js';
import { type StringIndexSignatureTypeMetadata } from './StringIndexSignatureTypeMetadata.js';
import { type StringTypeMetadata } from './StringTypeMetadata.js';

export type TypeMetadata =
  | AndTypeMetadata
  | AnyTypeMetadata
  | ArrayTypeMetadata
  | BooleanTypeMetadata
  | FloatTypeMetadata
  | IntegerTypeMetadata
  | LiteralTypeMetadata
  | NoneTypeMetadata
  | ObjectTypeMetadata
  | OrTypeMetadata
  | PropertyTypeMetadata
  | StringIndexSignatureTypeMetadata
  | StringTypeMetadata;
