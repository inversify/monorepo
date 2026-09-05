import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

export function collectNamedComponentSchemas(
  schemas: Record<string, JsonSchema> | undefined,
): JsonSchema[] {
  if (schemas === undefined) {
    return [];
  }

  return Object.entries(schemas).map(
    ([key, schema]: [string, JsonSchema]): JsonSchema => {
      if (isJsonSchemaObject(schema)) {
        if (schema.title === undefined) {
          schema.title = key;
        }

        return schema;
      }

      const wrappedSchema: JsonSchema = {
        ...(typeof schema === 'boolean' ? { allOf: [schema] } : {}),
        title: key,
      };

      schemas[key] = wrappedSchema;

      return wrappedSchema;
    },
  );
}

function isJsonSchemaObject(schema: unknown): schema is JsonSchemaObject {
  return (
    typeof schema === 'object' && schema !== null && !Array.isArray(schema)
  );
}
