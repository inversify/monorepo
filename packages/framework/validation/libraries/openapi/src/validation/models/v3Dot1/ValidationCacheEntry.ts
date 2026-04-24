import { type ValidateFunction } from 'ajv';

export interface ValidationCacheEntryBody {
  contentToValidateMap: Map<string | undefined, ValidateFunction>;
  required: boolean;
}

export interface ValidationCacheEntryHeader {
  parse: (value: string | string[] | undefined) => unknown;
  required: boolean;
  validate: ValidateFunction;
}

export interface ValidationCacheEntryParam {
  parse: (value: string | string[] | undefined) => unknown;
  validate: ValidateFunction;
}

export interface ValidationCacheEntryQuery {
  parse: (value: unknown) => unknown;
  required: boolean;
  validate: ValidateFunction;
}

export interface ValidationCacheEntry {
  body: ValidationCacheEntryBody | undefined;
  headers: Map<string, ValidationCacheEntryHeader> | undefined;
  params: Map<string, ValidationCacheEntryParam> | undefined;
  queries: Map<string, ValidationCacheEntryQuery> | undefined;
}
