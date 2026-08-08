import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonRootSchema,
  type JsonSchema,
  type JsonSchemaBoolean,
  type JsonSchemaObject,
  type JsonSchemaType,
} from '@inversifyjs/json-schema-types/2020-12';

import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';

export function transformJsonSchema(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
): TypeMetadata {
  if (typeof schema === 'boolean') {
    return transformBooleanJsonSchema(schema);
  } else {
    return transformObjectJsonSchema(schema, context);
  }
}

function buildTypeMetadata(
  id: string | undefined,
  typeMetadataPartial: Partial<TypeMetadata>,
  typeConstraints: TypeMetadata[],
): TypeMetadata {
  if (id !== undefined) {
    typeMetadataPartial.id = id;
  }

  let typeMetadata: TypeMetadata;

  if (typeConstraints.length === 0) {
    typeMetadata = {
      kind: TypeMetadataKind.anyType,
    };
  } else if (typeConstraints.length === 1) {
    const childType: Partial<TypeMetadata> = typeConstraints[0] as TypeMetadata;

    if (childType.kind === undefined) {
      /*
       * Tricky edge case in which a circular reference is found.
       * Any is returned as no constraints were found so far.
       */
      typeMetadata = {
        kind: TypeMetadataKind.anyType,
      };
    } else {
      typeMetadata = childType as TypeMetadata;
    }
  } else {
    typeMetadata = {
      children: typeConstraints,
      kind: TypeMetadataKind.and,
    };
  }

  return Object.assign<Partial<TypeMetadata>, TypeMetadata>(
    typeMetadataPartial,
    typeMetadata,
  );
}

function handleApplicatorVocabularyProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaItems(schema, context, typeConstraints);
  handleJsonSchemaProperties(schema, context, typeConstraints);
  handleJsonSchemaSubschemas(schema, context, typeConstraints);
}

function handleCoreVocabularyProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaRef(schema, context, typeConstraints);
}

function handleJsonSchemaItems(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.items !== undefined) {
    typeConstraints.push({
      children: [
        {
          child: transformJsonSchema(schema.items, context),
          kind: TypeMetadataKind.arrayType,
        },
        {
          kind: TypeMetadataKind.floatType,
        },
        {
          kind: TypeMetadataKind.literalType,
          literal: null,
        },
        {
          kind: TypeMetadataKind.objectType,
        },
        {
          kind: TypeMetadataKind.stringType,
        },
      ],
      kind: TypeMetadataKind.or,
    });
  }
}

function handleJsonSchemaAdditionalProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.additionalProperties !== undefined) {
    typeConstraints.push({
      child: transformJsonSchema(schema.additionalProperties, context),
      kind: TypeMetadataKind.stringIndexSignatureType,
    });
  }
}

function handleJsonSchemaProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaAdditionalProperties(schema, context, typeConstraints);

  if (schema.properties !== undefined) {
    for (const [propertyName, propertySchema] of Object.entries(
      schema.properties,
    )) {
      const isOptional: boolean = isPropertyOptional(schema, propertyName);

      typeConstraints.push({
        child: transformJsonSchema(propertySchema, context),
        isOptional,
        kind: TypeMetadataKind.propertyType,
        property: propertyName,
      });
    }
  }
}

function handleJsonSchemaRef(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.$ref !== undefined) {
    const dereferencedSchema: JsonRootSchema | JsonSchema | undefined =
      context.referenceMap.get(schema.$ref);

    if (dereferencedSchema === undefined) {
      throw new Error(`Unable to resolve "${schema.$ref}" $ref`);
    }

    typeConstraints.push(transformJsonSchema(dereferencedSchema, context));
  }
}

function handleJsonSchemaSubschemas(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.allOf !== undefined) {
    typeConstraints.push({
      children: schema.allOf.map((childSchema: JsonSchema) =>
        transformJsonSchema(childSchema, context),
      ),
      kind: TypeMetadataKind.and,
    });
  }

  if (schema.anyOf !== undefined) {
    typeConstraints.push({
      children: schema.anyOf.map((childSchema: JsonSchema) =>
        transformJsonSchema(childSchema, context),
      ),
      kind: TypeMetadataKind.or,
    });
  }

  if (schema.oneOf !== undefined) {
    typeConstraints.push({
      children: schema.oneOf.map((childSchema: JsonSchema) =>
        transformJsonSchema(childSchema, context),
      ),
      kind: TypeMetadataKind.or,
    });
  }
}

function handleValidationVocabularyProperties(
  schema: JsonSchemaObject,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.const !== undefined) {
    typeConstraints.push({
      kind: TypeMetadataKind.literalType,
      literal: schema.const,
    });
  }

  if (schema.enum !== undefined) {
    typeConstraints.push({
      children: schema.enum.map((enumValue: JsonValue) => ({
        kind: TypeMetadataKind.literalType,
        literal: enumValue,
      })),
      kind: TypeMetadataKind.or,
    });
  }

  if (schema.type !== undefined) {
    if (Array.isArray(schema.type)) {
      typeConstraints.push({
        children: schema.type.map((schemaType: JsonSchemaType) =>
          transformJsonSchemaType(schemaType),
        ),
        kind: TypeMetadataKind.or,
      });
    } else {
      typeConstraints.push(transformJsonSchemaType(schema.type));
    }
  }
}

function isPropertyOptional(
  schema: JsonSchemaObject,
  propertyName: string,
): boolean {
  return !(schema.required?.includes(propertyName) ?? false);
}

function transformBooleanJsonSchema(schema: JsonSchemaBoolean): TypeMetadata {
  if (schema) {
    return {
      kind: TypeMetadataKind.anyType,
    };
  } else {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }
}

function transformObjectJsonSchema(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
): TypeMetadata {
  const existingType: TypeMetadata | undefined =
    context.jsonSchemaToTypeMap.get(schema);

  if (existingType !== undefined) {
    return existingType;
  }

  const typeMetadataPartial: Partial<TypeMetadata> = {};

  context.jsonSchemaToTypeMap.set(schema, typeMetadataPartial as TypeMetadata);

  const id: string | undefined = schema.title;

  const typeConstraints: TypeMetadata[] = [];

  handleApplicatorVocabularyProperties(schema, context, typeConstraints);
  handleCoreVocabularyProperties(schema, context, typeConstraints);
  handleValidationVocabularyProperties(schema, typeConstraints);

  return buildTypeMetadata(id, typeMetadataPartial, typeConstraints);
}

function transformJsonSchemaType(schemaType: JsonSchemaType): TypeMetadata {
  switch (schemaType) {
    case 'array':
      return {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
      };
    case 'boolean':
      return {
        kind: TypeMetadataKind.booleanType,
      };
    case 'integer':
      return {
        kind: TypeMetadataKind.integerType,
      };
    case 'null':
      return {
        kind: TypeMetadataKind.literalType,
        literal: null,
      };
    case 'number':
      return {
        kind: TypeMetadataKind.floatType,
      };
    case 'object':
      return {
        kind: TypeMetadataKind.objectType,
      };
    case 'string':
      return {
        kind: TypeMetadataKind.stringType,
      };
  }
}
