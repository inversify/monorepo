import { type ValidateFunction } from 'ajv';

export interface ValidationCacheEntryHeader {
  parse: (value: string | string[] | undefined) => unknown;
  required: boolean;
  validate: ValidateFunction;
}

export interface ValidationCacheEntry {
  body: Map<string | undefined, ValidateFunction>;
  headers: Map<string, ValidationCacheEntryHeader> | undefined;
}
