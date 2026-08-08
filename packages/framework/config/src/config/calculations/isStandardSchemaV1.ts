import { type StandardSchemaV1 } from '@standard-schema/spec';

export function isStandardSchemaV1<TConfig>(
  value: unknown,
): value is StandardSchemaV1<TConfig> {
  if (typeof value !== 'object' || value === null || !('~standard' in value)) {
    return false;
  }

  const standard: unknown = (value as StandardSchemaV1)['~standard'];

  return (
    typeof standard === 'object' &&
    standard !== null &&
    'validate' in standard &&
    typeof standard.validate === 'function'
  );
}
