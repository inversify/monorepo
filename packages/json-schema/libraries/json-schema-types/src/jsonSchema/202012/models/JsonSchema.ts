import { JsonValue } from '../../../json/models/JsonValue';

type NonEmptyArray<T> = [T, ...T[]];

// https://json-schema.org/draft/2020-12/json-schema-core.html#name-boolean-json-schemas
export type JsonSchemaBoolean = boolean;

// https://json-schema.org/draft/2020-12/json-schema-core.html#name-the-json-schema-core-vocabu
export interface JsonSchemaCoreVocabularyProperties {
  $anchor?: string;
  $comments?: string;
  $defs?: Record<string, JsonSchema>;
  $dynamicAnchor?: string;
  $dynamicRef?: string;
  $id?: string;
  $ref?: string;
}

export type WellKnownVocabulary =
  | 'https://json-schema.org/draft/2020-12/vocab/applicator'
  | 'https://json-schema.org/draft/2020-12/vocab/content'
  | 'https://json-schema.org/draft/2020-12/vocab/core'
  | 'https://json-schema.org/draft/2020-12/vocab/format-annotation'
  | 'https://json-schema.org/draft/2020-12/vocab/format-assertion'
  | 'https://json-schema.org/draft/2020-12/vocab/meta-data'
  | 'https://json-schema.org/draft/2020-12/vocab/unevaluated'
  | 'https://json-schema.org/draft/2020-12/vocab/validation';

// https://json-schema.org/draft/2020-12/json-schema-core.html#name-the-json-schema-core-vocabu
export interface JsonRootSchemaCoreVocabularyProperties {
  $schema?: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  $vocabulary?: Record<WellKnownVocabulary | string, boolean>;
}

// https://json-schema.org/draft/2020-12/json-schema-core.html#section-4.3.1-6
export interface JsonSchemaUnknownProperties {
  [key: string]: JsonValue;
}

export type JsonSchemaKnownPropertiesObject =
  JsonSchemaCoreVocabularyProperties &
    JsonSchemaSubschemeAppliedProperties &
    JsonSchemaUnevaluatedLocationProperties &
    JsonSchemaStructuralValidationProperties &
    JsonSchemaFormatProperties &
    JsonSchemaStringContentEncodedProperties &
    JsonSchemaMetadataAnnotationsProperties;

export type JsonSchemaObject = JsonSchemaKnownPropertiesObject &
  JsonSchemaUnknownProperties;

// https://json-schema.org/draft/2020-12/json-schema-core.html#name-a-vocabulary-for-applying-s
export interface JsonSchemaSubschemeAppliedProperties {
  additionalProperties?: JsonSchema;
  allOf?: NonEmptyArray<JsonSchema>;
  anyOf?: NonEmptyArray<JsonSchema>;
  contains?: JsonSchema;
  dependentSchemas?: Record<string, JsonSchema>;
  else?: JsonSchema;
  if?: JsonSchema;
  items?: JsonSchema;
  not?: JsonSchema;
  oneOf?: NonEmptyArray<JsonSchema>;
  patternProperties?: Record<string, JsonSchema>;
  prefixItems?: NonEmptyArray<JsonSchema>;
  propertyNames?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  then?: JsonSchema;
}

// https://json-schema.org/draft/2020-12/json-schema-core.html#name-a-vocabulary-for-unevaluate
export interface JsonSchemaUnevaluatedLocationProperties {
  unevaluatedItems?: JsonSchema;
  unevaluatedProperties?: JsonSchema;
}

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-a-vocabulary-for-structural
export interface JsonSchemaStructuralValidationProperties {
  const?: JsonValue;
  dependentRequired?: Record<string, string[]>;
  enum?: NonEmptyArray<JsonValue>;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  maxContains?: number;
  maximum?: number;
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  minContains?: number;
  minimum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  multipleOf?: number;
  pattern?: string;
  required?: string[];
  type?: JsonSchemaType | JsonSchemaType[];
  uniqueItems?: boolean;
}

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-validation-keywords-for-any
export type JsonSchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'integer'
  | 'null';

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-vocabularies-for-semantic-c
export interface JsonSchemaFormatProperties {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  format?: JsonSchemaCustomFormat | JsonSchemaFormat;
}

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-custom-format-attributes
export type JsonSchemaCustomFormat = string;

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-defined-formats
export type JsonSchemaFormat =
  | 'date'
  | 'date-time'
  | 'duration'
  | 'email'
  | 'hostname'
  | 'idn-email'
  | 'idn-hostname'
  | 'ipv4'
  | 'ipv6'
  | 'iri'
  | 'iri-reference'
  | 'json-pointer'
  | 'regex'
  | 'relative-json-pointer'
  | 'time'
  | 'uri'
  | 'uri-reference'
  | 'uri-template'
  | 'uuid';

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-a-vocabulary-for-the-conten
export interface JsonSchemaStringContentEncodedProperties {
  contentEncoding?:
    | JsonSchemaBaseContentEncoding
    | JsonSchemaMimeContentTransferEncoding;
  contentMediaType?: string;
  contentSchema?: JsonSchema;
}

/*
 * https://json-schema.org/draft/2020-12/json-schema-validation.html#name-contentencoding
 * - https://www.rfc-editor.org/rfc/rfc4648.html
 */
export type JsonSchemaBaseContentEncoding =
  | 'base32'
  | 'base32hex'
  | 'base64'
  | 'base64url'
  | 'hex';

export type JsonSchemaMimeContentTransferEncoding =
  | 'base64'
  | 'binary'
  | '7bit'
  | '8bit'
  | 'ietf-token'
  | 'quoted-printable'
  | 'x-token';

// https://json-schema.org/draft/2020-12/json-schema-validation.html#name-a-vocabulary-for-basic-meta
export interface JsonSchemaMetadataAnnotationsProperties {
  default?: JsonValue;
  deprecated?: boolean;
  description?: string;
  examples?: JsonValue[];
  readOnly?: boolean;
  title?: string;
  writeOnly?: boolean;
}

export type JsonRootSchemaKnownPropertiesObject =
  JsonSchemaKnownPropertiesObject & JsonRootSchemaCoreVocabularyProperties;

export type JsonRootSchemaObject = JsonRootSchemaKnownPropertiesObject &
  JsonSchemaUnknownProperties;

export type JsonSchema = JsonSchemaBoolean | JsonSchemaObject;

export type JsonRootSchema = JsonSchemaBoolean | JsonRootSchemaObject;
