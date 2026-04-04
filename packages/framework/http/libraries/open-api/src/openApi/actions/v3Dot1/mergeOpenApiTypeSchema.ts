import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { tryBuildSchemaFromWellKnownType } from '../../../metadata/calculations/tryBuildSchemaFromWellKnownType.js';
import { getSchemaMetadata } from '../../../metadata/calculations/v3Dot1/getSchemaMetadata.js';
import { type OpenApiSchemaMetadata } from '../../../metadata/models/v3Dot1/OpenApiSchemaMetadata.js';

export function mergeOpenApiTypeSchema(
  schemasObject: Record<string, OpenApi3Dot1SchemaObject>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): void {
  const schemaMetadata: OpenApiSchemaMetadata = getSchemaMetadata(type);

  const schemaName: string = schemaMetadata.name ?? type.name;

  if (schemasObject[schemaName] !== undefined) {
    return;
  }

  const [jsonSchema, jsonSchemaProperties]: [
    JsonSchema,
    Record<string, JsonSchema>,
  ] = initializeJsonSchema(schemaMetadata);

  const requiredProperties: string[] = [];

  schemasObject[schemaName] = jsonSchema;

  for (const [propertyKey, propertySchema] of schemaMetadata.properties) {
    if (propertySchema.required) {
      requiredProperties.push(propertyKey);
    }

    if (propertySchema.schema === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const typescriptDesignType: Function | undefined = getOwnReflectMetadata(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        type.prototype,
        'design:type',
        propertyKey,
      );

      if (typescriptDesignType === undefined) {
        throw new Error(
          `[@inversifyjs/http-open-api] Unable to determine type for property "${type.name}.${propertyKey}". Are you enabling "emitDecoratorMetadata" and "experimentalDecorators" TypeScript compiler options?`,
        );
      }

      const schemaFromWellKnownType: JsonSchema | undefined =
        tryBuildSchemaFromWellKnownType(typescriptDesignType);

      if (schemaFromWellKnownType === undefined) {
        mergeOpenApiTypeSchema(schemasObject, typescriptDesignType);

        const propertySchemaMetadata: OpenApiSchemaMetadata =
          getSchemaMetadata(typescriptDesignType);

        const propertySchemaName: string =
          propertySchemaMetadata.name ?? typescriptDesignType.name;

        jsonSchemaProperties[propertyKey] = {
          $ref: `#/components/schemas/${escapeJsonPointerFragments(propertySchemaName)}`,
        };

        continue;
      }

      jsonSchemaProperties[propertyKey] = schemaFromWellKnownType;
    } else {
      jsonSchemaProperties[propertyKey] = propertySchema.schema;
    }
  }

  if (requiredProperties.length > 0 && typeof jsonSchema === 'object') {
    if (jsonSchema.required === undefined) {
      jsonSchema.required = [];
    }

    jsonSchema.required.push(...requiredProperties);
  }

  for (const reference of schemaMetadata.references) {
    mergeOpenApiTypeSchema(schemasObject, reference);
  }
}

function initializeJsonSchema(
  schemaMetadata: OpenApiSchemaMetadata,
): [JsonSchema, Record<string, JsonSchema>] {
  const jsonSchemaProperties: Record<string, JsonSchema> = {};

  const jsonSchema: JsonSchema = initializeJsonSchemaPropertiesObject(
    schemaMetadata,
    jsonSchemaProperties,
  );

  return [jsonSchema, jsonSchemaProperties];
}

function initializeJsonSchemaPropertiesObject(
  schemaMetadata: OpenApiSchemaMetadata,
  jsonSchemaProperties: Record<string, JsonSchema>,
): JsonSchema {
  const jsonSchemas: JsonSchemaObject[] = [];

  if (typeof schemaMetadata.customAttributes === 'object') {
    jsonSchemas.push(schemaMetadata.customAttributes);
  }

  if (
    schemaMetadata.schema === undefined ||
    schemaMetadata.properties.size > 0
  ) {
    jsonSchemas.push({
      properties: jsonSchemaProperties,
      type: 'object',
    });
  }

  const jsonSchema: JsonSchemaObject = Object.assign(
    {},
    ...jsonSchemas,
  ) as JsonSchemaObject;

  if (schemaMetadata.schema === undefined) {
    return jsonSchema;
  } else {
    if (jsonSchemas.length === 0) {
      return schemaMetadata.schema;
    } else {
      if (jsonSchema.allOf === undefined) {
        jsonSchema.allOf = [schemaMetadata.schema];
      } else {
        jsonSchema.allOf.push(schemaMetadata.schema);
      }

      return jsonSchema;
    }
  }
}
