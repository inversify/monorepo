import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type JsonSchema } from '@inversifyjs/json-schema-types/2020-12';

export function getOpenApiComponentSchemas(
  document: JsonValue,
): Record<string, JsonSchema> | undefined {
  if (
    document === null ||
    typeof document !== 'object' ||
    Array.isArray(document)
  ) {
    return undefined;
  }

  const components: JsonValue | undefined = document['components'];

  if (
    components === null ||
    typeof components !== 'object' ||
    Array.isArray(components)
  ) {
    return undefined;
  }

  const schemas: JsonValue | undefined = components['schemas'];

  if (
    schemas === null ||
    typeof schemas !== 'object' ||
    Array.isArray(schemas)
  ) {
    return undefined;
  }

  return schemas as Record<string, JsonSchema>;
}
