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
import {
  type DynamicScopeEntry,
  type ResolutionContext,
  type ResolutionFailure,
  type SchemaResolutionSuccessNode,
  type SchemaResolutionSuccessTree,
} from '@inversifyjs/json-schema-utils/2020-12';

import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaInternalContext } from '../models/TransformJsonSchemaInternalContext.js';
import { simplifyTypeMetadata } from './simplifyTypeMetadata.js';

const DYNAMIC_SCOPE_KEY_SEPARATOR: string = '|';

export function transformJsonSchema(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
): TypeMetadata {
  return simplifyTypeMetadata(
    transformJsonSchemaNode(schema, {
      dynamicScopeEntries: [],
      inProgressJsonSchemaToTypeMap: new Map(),
      jsonSchemaToTypeMap: new Map(),
      resolver: context.resolver,
      typeMetadataIdSet: new Set(),
    }),
  );
}

function assignTypeMetadataId(
  typeMetadata: Partial<TypeMetadata>,
  id: string | undefined,
  typeMetadataIdSet: Set<string>,
): void {
  if (id === undefined || typeMetadata.id !== undefined) {
    return;
  }

  if (typeMetadataIdSet.has(id)) {
    throw new Error(`Duplicated TypeMetadata id "${id}"`);
  }

  typeMetadataIdSet.add(id);
  typeMetadata.id = id;
}

function assertJsonSchema(
  value: JsonValue,
  refKeyword: string,
): JsonRootSchema | JsonSchema {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  throw new Error(`Resolved ${refKeyword} value is not a JSON Schema`);
}

/*
 * Cache key for a schema under a dynamic scope. First-seen unique canonical
 * ids keep the key bounded when the stack cycles ([A, B, A] is still A|B).
 * The last resource is appended as well: $dynamicRef only does the outer
 * $dynamicAnchor walk if that last resource defines the name; otherwise it
 * behaves like $ref in the current resource. [A, B] (last B) and [A, B, A]
 * (last A) share first-seen ids but can resolve an id-less $dynamicRef to
 * different targets.
 */
function buildDynamicScopeKey(
  dynamicScopeEntries: DynamicScopeEntry[],
): string {
  const encodedCanonicalIds: string[] = [];
  const seenCanonicalIds: Set<string> = new Set();

  for (const dynamicScopeEntry of dynamicScopeEntries) {
    const canonicalId: string =
      dynamicScopeEntry.lexicalScope.$canonicalId.toString();

    if (!seenCanonicalIds.has(canonicalId)) {
      seenCanonicalIds.add(canonicalId);
      encodedCanonicalIds.push(encodeURIComponent(canonicalId));
    }
  }

  const lastDynamicScopeEntry: DynamicScopeEntry | undefined =
    dynamicScopeEntries[dynamicScopeEntries.length - 1];

  if (lastDynamicScopeEntry !== undefined) {
    encodedCanonicalIds.push(
      encodeURIComponent(
        lastDynamicScopeEntry.lexicalScope.$canonicalId.toString(),
      ),
    );
  }

  return encodedCanonicalIds.join(DYNAMIC_SCOPE_KEY_SEPARATOR);
}

function buildTypeMetadata(
  id: string | undefined,
  typeMetadataPartial: Partial<TypeMetadata>,
  typeConstraints: TypeMetadata[],
  typeMetadataIdSet: Set<string>,
): TypeMetadata {
  let typeMetadata: TypeMetadata;

  if (typeConstraints.length === 0) {
    typeMetadata = {
      kind: TypeMetadataKind.anyType,
    };
  } else if (typeConstraints.length === 1) {
    const childType: Partial<TypeMetadata> = typeConstraints[0] as TypeMetadata;

    if (childType.kind === undefined) {
      if (childType === typeMetadataPartial) {
        /*
         * Self-cycle with no other constraints yet. Any is returned as no
         * constraints were found so far.
         */
        typeMetadata = {
          kind: TypeMetadataKind.anyType,
        };
      } else {
        /*
         * Cycle to another in-progress schema. Keep that node so applicators
         * such as properties can close the loop once the target is completed.
         */
        assignTypeMetadataId(childType, id, typeMetadataIdSet);

        return childType as TypeMetadata;
      }
    } else {
      typeMetadata = childType as TypeMetadata;
    }
  } else {
    typeMetadata = {
      children: typeConstraints,
      kind: TypeMetadataKind.and,
    };
  }

  assignTypeMetadataId(typeMetadataPartial, id, typeMetadataIdSet);

  const typeMetadataId: string | undefined = typeMetadataPartial.id;

  Object.assign<Partial<TypeMetadata>, TypeMetadata>(
    typeMetadataPartial,
    typeMetadata,
  );

  if (typeMetadataId !== undefined) {
    typeMetadataPartial.id = typeMetadataId;
  }

  return typeMetadataPartial as TypeMetadata;
}

function formatResolutionFailure(failure: ResolutionFailure): string {
  if (failure.resolutionContextStack.length === 0) {
    return failure.reason;
  }

  return `${failure.reason} (${failure.resolutionContextStack
    .map((resolutionContext: ResolutionContext) => resolutionContext.$ref)
    .join(' -> ')})`;
}

function getOrCreateScopedTypeMetadataMap(
  schema: JsonRootSchema | JsonSchema,
  schemaToScopedTypeMetadataMap: Map<
    JsonRootSchema | JsonSchema,
    Map<string, TypeMetadata>
  >,
): Map<string, TypeMetadata> {
  const existingScopedTypeMetadataMap: Map<string, TypeMetadata> | undefined =
    schemaToScopedTypeMetadataMap.get(schema);

  if (existingScopedTypeMetadataMap !== undefined) {
    return existingScopedTypeMetadataMap;
  }

  const scopedTypeMetadataMap: Map<string, TypeMetadata> = new Map();

  schemaToScopedTypeMetadataMap.set(schema, scopedTypeMetadataMap);

  return scopedTypeMetadataMap;
}

function handleApplicatorVocabularyProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaInternalContext,
  typeConstraints: TypeMetadata[],
  resolutionTree: SchemaResolutionSuccessTree,
): void {
  handleJsonSchemaItems(schema, context, typeConstraints);
  handleJsonSchemaProperties(schema, context, typeConstraints);
  handleJsonSchemaSubschemas(schema, context, typeConstraints);
  handleJsonSchemaRefs(resolutionTree, context, typeConstraints);
}

function handleJsonSchemaItems(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaInternalContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.items !== undefined) {
    typeConstraints.push({
      children: [
        {
          child: transformJsonSchemaNode(schema.items, context),
          kind: TypeMetadataKind.arrayType,
        },
        {
          kind: TypeMetadataKind.booleanType,
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
  context: TransformJsonSchemaInternalContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.additionalProperties !== undefined) {
    typeConstraints.push({
      child: transformJsonSchemaNode(schema.additionalProperties, context),
      kind: TypeMetadataKind.stringIndexSignatureType,
    });
  }
}

function handleJsonSchemaProperties(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaInternalContext,
  typeConstraints: TypeMetadata[],
): void {
  handleJsonSchemaAdditionalProperties(schema, context, typeConstraints);

  if (schema.properties !== undefined) {
    for (const [propertyName, propertySchema] of Object.entries(
      schema.properties,
    )) {
      const isOptional: boolean = isPropertyOptional(schema, propertyName);

      typeConstraints.push({
        child: transformJsonSchemaNode(propertySchema, context),
        isOptional,
        kind: TypeMetadataKind.propertyType,
        property: propertyName,
      });
    }
  }
}

function handleJsonSchemaRefs(
  resolutionTree: SchemaResolutionSuccessTree,
  context: TransformJsonSchemaInternalContext,
  typeConstraints: TypeMetadata[],
): void {
  if (resolutionTree.$dynamicRef !== undefined) {
    typeConstraints.push(
      transformResolvedSchema(
        resolutionTree.$dynamicRef,
        '$dynamicRef',
        context,
      ),
    );
  }

  if (resolutionTree.$ref !== undefined) {
    typeConstraints.push(
      transformResolvedSchema(resolutionTree.$ref, '$ref', context),
    );
  }
}

function handleJsonSchemaSubschemas(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaInternalContext,
  typeConstraints: TypeMetadata[],
): void {
  if (schema.allOf !== undefined) {
    typeConstraints.push({
      children: schema.allOf.map((childSchema: JsonSchema) =>
        transformJsonSchemaNode(childSchema, context),
      ),
      kind: TypeMetadataKind.and,
    });
  }

  if (schema.anyOf !== undefined) {
    typeConstraints.push({
      children: schema.anyOf.map((childSchema: JsonSchema) =>
        transformJsonSchemaNode(childSchema, context),
      ),
      kind: TypeMetadataKind.or,
    });
  }

  if (schema.oneOf !== undefined) {
    typeConstraints.push({
      children: schema.oneOf.map((childSchema: JsonSchema) =>
        transformJsonSchemaNode(childSchema, context),
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

function resolveSchemaTree(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaInternalContext,
): SchemaResolutionSuccessTree {
  const resolutionResult: ReturnType<
    TransformJsonSchemaInternalContext['resolver']['resolveSchema']
  > = context.resolver.resolveSchema(schema, context.dynamicScopeEntries);

  if (!resolutionResult.isRight) {
    throw new Error(formatResolutionFailure(resolutionResult.value));
  }

  return resolutionResult.value;
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

function transformJsonSchemaNode(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaInternalContext,
): TypeMetadata {
  if (typeof schema === 'boolean') {
    return transformBooleanJsonSchema(schema);
  } else {
    return transformObjectJsonSchema(schema, context);
  }
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

function transformObjectJsonSchema(
  schema: JsonSchemaObject,
  context: TransformJsonSchemaInternalContext,
): TypeMetadata {
  const resolutionTree: SchemaResolutionSuccessTree = resolveSchemaTree(
    schema,
    context,
  );

  const scopedContext: TransformJsonSchemaInternalContext = {
    ...context,
    dynamicScopeEntries: resolutionTree.dynamicScopeEntries,
  };

  const dynamicScopeKey: string = buildDynamicScopeKey(
    resolutionTree.dynamicScopeEntries,
  );
  const inProgressScopedTypeMetadataMap: Map<string, TypeMetadata> =
    getOrCreateScopedTypeMetadataMap(
      schema,
      scopedContext.inProgressJsonSchemaToTypeMap,
    );

  const inProgressType: TypeMetadata | undefined =
    inProgressScopedTypeMetadataMap.get(dynamicScopeKey);

  if (inProgressType !== undefined) {
    return inProgressType;
  }

  const scopedTypeMetadataMap: Map<string, TypeMetadata> =
    getOrCreateScopedTypeMetadataMap(schema, scopedContext.jsonSchemaToTypeMap);

  const existingType: TypeMetadata | undefined =
    scopedTypeMetadataMap.get(dynamicScopeKey);

  if (existingType !== undefined) {
    return existingType;
  }

  const typeMetadataPartial: Partial<TypeMetadata> = {};

  inProgressScopedTypeMetadataMap.set(
    dynamicScopeKey,
    typeMetadataPartial as TypeMetadata,
  );
  scopedTypeMetadataMap.set(
    dynamicScopeKey,
    typeMetadataPartial as TypeMetadata,
  );

  const id: string | undefined = schema.title;

  const typeConstraints: TypeMetadata[] = [];

  handleApplicatorVocabularyProperties(
    schema,
    scopedContext,
    typeConstraints,
    resolutionTree,
  );
  handleValidationVocabularyProperties(schema, typeConstraints);

  const typeMetadata: TypeMetadata = buildTypeMetadata(
    id,
    typeMetadataPartial,
    typeConstraints,
    scopedContext.typeMetadataIdSet,
  );

  scopedTypeMetadataMap.set(dynamicScopeKey, typeMetadata);
  inProgressScopedTypeMetadataMap.delete(dynamicScopeKey);

  return typeMetadata;
}

function transformResolvedSchema(
  node: SchemaResolutionSuccessNode,
  refKeyword: string,
  context: TransformJsonSchemaInternalContext,
): TypeMetadata {
  return transformJsonSchemaNode(assertJsonSchema(node.value, refKeyword), {
    ...context,
    dynamicScopeEntries: node.dynamicScopeEntries,
  });
}
