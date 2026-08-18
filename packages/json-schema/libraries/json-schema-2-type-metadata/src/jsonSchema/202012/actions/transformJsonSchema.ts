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

import { type DynamicAnchorBindings } from '../models/DynamicAnchorBindings.js';
import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type ParsedJsonSchemaReference } from '../models/ParsedJsonSchemaReference.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';
import { buildJsonSchemaResource } from './buildJsonSchemaResource.js';
import { enterJsonSchemaScope } from './enterJsonSchemaScope.js';
import { extendDynamicAnchorBindings } from './extendDynamicAnchorBindings.js';
import { parseJsonSchemaReference } from './parseJsonSchemaReference.js';
import { resolveDynamicAnchorSchema } from './resolveDynamicAnchorSchema.js';
import { resolveJsonSchemaReference } from './resolveJsonSchemaReference.js';

const EMPTY_DYNAMIC_ANCHOR_BINDINGS: DynamicAnchorBindings = {
  key: '',
  nameToResourceMap: new Map(),
};

export function transformJsonSchema(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
): TypeMetadata {
  if (typeof schema === 'boolean') {
    return transformBooleanJsonSchema(schema);
  } else {
    return transformObjectJsonSchema(
      schema,
      context,
      buildEntryScope(schema, context),
    );
  }
}

function buildEntryScope(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
): TransformJsonSchemaScope {
  /*
   * The outermost dynamic scope is the schema transformation begins at, even
   * when it does not root a resource. A schema the context never indexed roots
   * an anchorless one of its own.
   */
  const resource: JsonSchemaResource =
    context.resourceMap.get(schema) ??
    registerJsonSchemaResource(context, schema);

  return {
    dynamicAnchorBindings: extendDynamicAnchorBindings(
      EMPTY_DYNAMIC_ANCHOR_BINDINGS,
      resource,
    ),
    resource,
  };
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
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaItems(schema, context, scope, typeConstraints);
  handleJsonSchemaProperties(schema, context, scope, typeConstraints);
  handleJsonSchemaSubschemas(schema, context, scope, typeConstraints);
}

function handleCoreVocabularyProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaRef(schema, context, scope, typeConstraints);
  handleJsonSchemaDynamicRef(schema, context, scope, typeConstraints);
}

function handleJsonSchemaItems(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.items !== undefined) {
    typeConstraints.push({
      children: [
        {
          child: transformJsonSchemaInScope(schema.items, context, scope),
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
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.additionalProperties !== undefined) {
    typeConstraints.push({
      child: transformJsonSchemaInScope(
        schema.additionalProperties,
        context,
        scope,
      ),
      kind: TypeMetadataKind.stringIndexSignatureType,
    });
  }
}

function handleJsonSchemaProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaAdditionalProperties(schema, context, scope, typeConstraints);

  if (schema.properties !== undefined) {
    for (const [propertyName, propertySchema] of Object.entries(
      schema.properties,
    )) {
      const isOptional: boolean = isPropertyOptional(schema, propertyName);

      typeConstraints.push({
        child: transformJsonSchemaInScope(propertySchema, context, scope),
        isOptional,
        kind: TypeMetadataKind.propertyType,
        property: propertyName,
      });
    }
  }
}

function handleJsonSchemaDynamicRef(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.$dynamicRef !== undefined) {
    const reference: ParsedJsonSchemaReference = parseJsonSchemaReference(
      schema.$dynamicRef,
    );

    const initialSchema: JsonRootSchema | JsonSchema | undefined =
      resolveJsonSchemaReference(reference, context, scope);

    if (initialSchema === undefined) {
      throw new Error(`Unable to resolve "${schema.$dynamicRef}" $dynamicRef`);
    }

    const dereferencedSchema: JsonRootSchema | JsonSchema =
      resolveDynamicAnchorSchema(
        reference.anchor,
        initialSchema,
        context,
        scope,
      );

    typeConstraints.push(
      transformJsonSchemaInScope(dereferencedSchema, context, scope),
    );
  }
}

function handleJsonSchemaRef(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.$ref !== undefined) {
    const dereferencedSchema: JsonRootSchema | JsonSchema | undefined =
      resolveJsonSchemaReference(
        parseJsonSchemaReference(schema.$ref),
        context,
        scope,
      );

    if (dereferencedSchema === undefined) {
      throw new Error(`Unable to resolve "${schema.$ref}" $ref`);
    }

    typeConstraints.push(
      transformJsonSchemaInScope(dereferencedSchema, context, scope),
    );
  }
}

function handleJsonSchemaSubschemas(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.allOf !== undefined) {
    typeConstraints.push({
      children: schema.allOf.map((childSchema: JsonSchema) =>
        transformJsonSchemaInScope(childSchema, context, scope),
      ),
      kind: TypeMetadataKind.and,
    });
  }

  if (schema.anyOf !== undefined) {
    typeConstraints.push({
      children: schema.anyOf.map((childSchema: JsonSchema) =>
        transformJsonSchemaInScope(childSchema, context, scope),
      ),
      kind: TypeMetadataKind.or,
    });
  }

  if (schema.oneOf !== undefined) {
    typeConstraints.push({
      children: schema.oneOf.map((childSchema: JsonSchema) =>
        transformJsonSchemaInScope(childSchema, context, scope),
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

function registerJsonSchemaResource(
  context: TransformJsonSchemaContext,
  schema: JsonSchemaObject,
): JsonSchemaResource {
  const resource: JsonSchemaResource = buildJsonSchemaResource(context);

  context.resourceMap.set(schema, resource);

  return resource;
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

function transformJsonSchemaInScope(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
): TypeMetadata {
  if (typeof schema === 'boolean') {
    return transformBooleanJsonSchema(schema);
  } else {
    return transformObjectJsonSchema(
      schema,
      context,
      enterJsonSchemaScope(schema, context, scope),
    );
  }
}

function transformObjectJsonSchema(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
): TypeMetadata {
  const bindingsKey: string = scope.dynamicAnchorBindings.key;

  let bindingsToTypeMap: Map<string, TypeMetadata> | undefined =
    context.schemaToBindingsToTypeMap.get(schema);

  if (bindingsToTypeMap === undefined) {
    bindingsToTypeMap = new Map();

    context.schemaToBindingsToTypeMap.set(schema, bindingsToTypeMap);
  }

  const existingType: TypeMetadata | undefined =
    bindingsToTypeMap.get(bindingsKey);

  if (existingType !== undefined) {
    return existingType;
  }

  const typeMetadataPartial: Partial<TypeMetadata> = {};

  bindingsToTypeMap.set(bindingsKey, typeMetadataPartial as TypeMetadata);

  const id: string | undefined = schema.title;

  const typeConstraints: TypeMetadata[] = [];

  handleApplicatorVocabularyProperties(schema, context, scope, typeConstraints);
  handleCoreVocabularyProperties(schema, context, scope, typeConstraints);
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
