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

export interface ValidationCacheEntry {
  body: ValidationCacheEntryBody | undefined;
  headers: Map<string, ValidationCacheEntryHeader> | undefined;
}
