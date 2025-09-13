import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  JsonSchema,
  JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
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

  if (requiredProperties.length > 0 && typeof jsonSchema === 'object') {
    jsonSchema.required = requiredProperties;
  }
}

function initializeJsonSchema(
  schemaMetadata: SchemaMetadata,
): [JsonSchema, Record<string, JsonSchema>] {
  const jsonSchemaProperties: Record<string, JsonSchema> = {};

  let jsonSchema: JsonSchema;

  if (schemaMetadata.schema === undefined) {
    jsonSchema = initializeJsonSchemaPropertiesObject(
      schemaMetadata,
      jsonSchemaProperties,
    );
  } else {
    if (schemaMetadata.properties.size === 0) {
      jsonSchema = schemaMetadata.schema;
    } else {
      jsonSchema = initializeJsonSchemaPropertiesObject(
        schemaMetadata,
        jsonSchemaProperties,
      );

      jsonSchema.allOf = [schemaMetadata.schema];
    }
  }

  return [jsonSchema, jsonSchemaProperties];
}

function initializeJsonSchemaPropertiesObject(
  schemaMetadata: SchemaMetadata,
  jsonSchemaProperties: Record<string, JsonSchema>,
): JsonSchemaObject {
  const jsonSchemaObject: JsonSchema = {
    properties: jsonSchemaProperties,
    type: 'object',
  };

  if (typeof schemaMetadata.customAttributes === 'object') {
    return {
      ...schemaMetadata.customAttributes,
      ...jsonSchemaObject,
    };
  } else {
    return jsonSchemaObject;
  }
}
