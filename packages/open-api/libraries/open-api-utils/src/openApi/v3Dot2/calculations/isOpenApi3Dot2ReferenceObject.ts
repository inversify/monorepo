import { type JsonValue } from '@inversifyjs/json-schema-types';

const OPEN_API_3_DOT_2_REFERENCE_OBJECT_KEYS: ReadonlySet<string> = new Set([
  '$ref',
  'description',
  'summary',
]);

export function isOpenApi3Dot2ReferenceObject(
  value: JsonValue,
): value is JsonValue & { $ref: string } {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    typeof value['$ref'] !== 'string'
  ) {
    return false;
  }

  return Object.keys(value).every((key: string) =>
    OPEN_API_3_DOT_2_REFERENCE_OBJECT_KEYS.has(key),
  );
}
