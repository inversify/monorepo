import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type JsonSchemaObject } from '@inversifyjs/json-schema-types/2020-12';
import { Uri } from '@inversifyjs/uri';

export function getClosestAncestorOrNodeId(
  rootSchema: JsonValue,
  jsonPointer: string,
  baseId: string,
): string {
  const jsonPointerParts: string[] = jsonPointer.split('/').slice(1);

  let jsonSchemaAncestor: JsonValue | undefined = rootSchema;

  let closestId: string = maybeResolveId(
    maybeGetId(jsonSchemaAncestor),
    baseId,
  );

  for (const jsonPointerPart of jsonPointerParts) {
    jsonSchemaAncestor = resolveJsonPointer(
      jsonSchemaAncestor,
      `/${jsonPointerPart}`,
    );

    if (jsonSchemaAncestor === undefined) {
      return closestId;
    }

    const nodeId: string | undefined = maybeGetId(jsonSchemaAncestor);

    if (nodeId !== undefined) {
      closestId = maybeResolveId(nodeId, closestId);
    }
  }

  return closestId;
}

function maybeGetId(value: JsonValue): string | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return (value as Partial<JsonSchemaObject>).$id;
  }

  return undefined;
}

function maybeResolveId(id: string | undefined, baseId: string): string {
  if (id === undefined) {
    return baseId;
  }

  try {
    return new Uri(id, baseId).toString();
  } catch (_error: unknown) {
    return baseId;
  }
}
