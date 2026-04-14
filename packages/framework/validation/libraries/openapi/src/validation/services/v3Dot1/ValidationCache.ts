import { type ValidationCacheEntry } from '../../models/v3Dot1/ValidationCacheEntry.js';
import { ValidationCache as BaseValidationCache } from '../ValidationCache.js';

export class ValidationCache extends BaseValidationCache<ValidationCacheEntry> {
  protected _createCacheEntry(): ValidationCacheEntry {
    return {
      body: new Map(),
      headers: new Map(),
    };
  }
}
