import { type ValidateFunction } from 'ajv';

export interface ValidationCacheEntry {
  body: Map<string | undefined, ValidateFunction>;
}
