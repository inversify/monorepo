import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { JsonSchema } from '@inversifyjs/json-schema-types/2020-12';
import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { tryBuildSchemaFromWellKnownType } from '../../metadata/calculations/tryBuildSchemaFromWellKnownType';
import { SchemaMetadata } from '../../metadata/models/SchemaMetadata';
import { getSchemaMetadata } from '../calculations/getSchemaMetadata';

export function mergeOpenApiTypeSchema(
  schemasObject: Record<string, OpenApi3Dot1SchemaObject>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): void {
  const schemaMetadata: SchemaMetadata = getSchemaMetadata(type);

  const schemaName: string = schemaMetadata.name ?? type.name;

  if (schemasObject[schemaName] !== undefined) {
    return;
  }

  const jsonSchemaProperties: Record<string, JsonSchema> = {};

  const jsonSchema: JsonSchema = {
    additionalProperties: false,
    properties: jsonSchemaProperties,
    type: 'object',
  };

  schemasObject[schemaName] = jsonSchema;

  for (const [propertyKey, propertySchema] of schemaMetadata.properties) {
    if (propertySchema.schema === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const typescriptDesignType: Function | undefined = getOwnReflectMetadata(
        type,
        'design:type',
        propertyKey,
      );

      if (typescriptDesignType === undefined) {
        throw new Error(
          `Unable to determine type for property "${type.name}.${propertyKey}"`,
        );
      }

      const schemaFromWellKnownType: JsonSchema | undefined =
        tryBuildSchemaFromWellKnownType(typescriptDesignType);

      if (schemaFromWellKnownType === undefined) {
        mergeOpenApiTypeSchema(schemasObject, typescriptDesignType);

        const propertySchemaMetadata: SchemaMetadata =
          getSchemaMetadata(typescriptDesignType);

        const propertySchemaName: string =
          propertySchemaMetadata.name ?? typescriptDesignType.name;

        jsonSchemaProperties[propertyKey] = {
          $ref: `#/components/schemas/${escapeJsonPointerFragments(propertySchemaName)}`,
        };

        return;
      }

      jsonSchemaProperties[propertyKey] = schemaFromWellKnownType;
    } else {
      jsonSchemaProperties[propertyKey] = propertySchema.schema;
    }
  }
}
