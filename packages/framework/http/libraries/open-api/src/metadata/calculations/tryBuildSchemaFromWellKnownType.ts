import { JsonSchema } from '@inversifyjs/json-schema-types/2020-12';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const WELL_KNOWN_TYPE_TO_JSON_SCHEMA_MAP: Map<Function, JsonSchema> = new Map<
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  Function,
  JsonSchema
>([
  [Array, { type: 'array' }],
  [Boolean, { type: 'boolean' }],
  [Number, { type: 'number' }],
  [Object, { type: 'object' }],
  [String, { type: 'string' }],
]);

export function tryBuildSchemaFromWellKnownType(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): JsonSchema | undefined {
  return WELL_KNOWN_TYPE_TO_JSON_SCHEMA_MAP.get(type);
}
