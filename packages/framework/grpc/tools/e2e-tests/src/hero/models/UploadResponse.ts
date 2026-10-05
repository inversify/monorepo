import { type UploadResponse } from '../generated/hero.js';

export type { UploadResponse };

export function isUploadResponse(value: unknown): value is UploadResponse {
  if (typeof value !== 'object' || value === null || !('names' in value)) {
    return false;
  }

  const names: unknown = value.names;

  return (
    Array.isArray(names) &&
    names.every((name: unknown): boolean => typeof name === 'string')
  );
}
