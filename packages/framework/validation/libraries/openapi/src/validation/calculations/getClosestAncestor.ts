import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type JsonSchemaObject } from '@inversifyjs/json-schema-types/2020-12';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

const SPACES_INDENTATION: number = 2;

export function getClosestAncestorId(
  rootSchema: JsonValue,
  jsonPointer: string,
): string | undefined {
  const jsonPointerParts: string[] = jsonPointer.split('/').slice(1);

  let jsonSchemaAncestor: JsonValue | undefined = rootSchema;

  let closestId: string | undefined = maybeGetId(jsonSchemaAncestor);

  for (const jsonPointerPart of jsonPointerParts) {
    jsonSchemaAncestor = resolveJsonPointer(
      jsonSchemaAncestor,
      `/${jsonPointerPart}`,
    );

    if (jsonSchemaAncestor === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.unknown,
        `Could not find JSON schema for JSON pointer ${jsonPointer}.
JSON schema: ${JSON.stringify(rootSchema, null, SPACES_INDENTATION)}`,
      );
    }

    closestId = maybeGetId(jsonSchemaAncestor) ?? closestId;
  }

  return closestId;
}

function maybeGetId(value: JsonValue): string | undefined {
  if (typeof value === 'object' && value !== null) {
    return (value as Partial<JsonSchemaObject>).$id;
  }

  return undefined;
}
