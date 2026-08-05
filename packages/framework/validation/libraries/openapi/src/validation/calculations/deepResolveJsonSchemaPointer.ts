import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type JsonSchemaObject } from '@inversifyjs/json-schema-types/2020-12';
import { Uri } from '@inversifyjs/uri';

const SEPARATOR: string = '/';
const SEPARATOR_ENCODED: string = '~1';
const ENCODER: string = '~';
const ENCODER_ENCODED: string = '~0';

/**
 * Deeply resolves a JSON schema pointer to a JSON value.
 * @param resolveNonJsonPointer - A function that resolves a JSON schema URI to a JSON schema.
 * The function must return `undefined` if the schema is not found. The function is responsible
 * to resolve schemas with no fragments or anchor fragments.
 * @returns A function that resolves a JSON schema pointer to a JSON value.
 */
export function deepResolveJsonSchemaPointer(
  resolveNonJsonPointer: (uri: string) => JsonValue | undefined,
): (schema: JsonValue, pointer: string) => JsonValue | undefined {
  function innerDeepResolveJsonSchemaPointer(
    schema: JsonValue,
    pointer: string,
  ): JsonValue | undefined {
    const pointerSegments: string[] = pointer
      .split(SEPARATOR)
      .map((segment: string) =>
        segment
          .replaceAll(SEPARATOR_ENCODED, SEPARATOR)
          .replaceAll(ENCODER_ENCODED, ENCODER),
      );

    if (pointerSegments[0] === undefined || pointerSegments[0] !== '') {
      throw new Error(`Invalid JSON pointer "${pointer}"`);
    }

    let result: JsonValue | undefined = schema;
    let id: string | undefined =
      schema === null || typeof schema !== 'object'
        ? undefined
        : (schema as Partial<JsonSchemaObject>).$id;

    for (let i: number = 1; i < pointerSegments.length; ++i) {
      const pointerSegment: string = pointerSegments[i] as string;

      if (result == null || typeof result !== 'object') {
        result = undefined;
        break;
      }

      if (Array.isArray(result)) {
        const pointerIndex: number = parseInt(pointerSegment);

        if (Number.isNaN(pointerIndex)) {
          result = undefined;
          break;
        }

        result = result[pointerIndex];
      } else {
        result = result[pointerSegment];
      }

      const resultId: string | undefined =
        result === null || typeof result !== 'object'
          ? undefined
          : (result as Partial<JsonSchemaObject>).$id;

      if (resultId != undefined) {
        try {
          id = new Uri(resultId, id).toString();
        } catch (_error: unknown) {
          // We could not resolve the id, but a later absolute uri id might be found to recover from this state
          id = undefined;
        }
      }
    }

    if (result !== null && typeof result === 'object') {
      const ref: string | undefined = (result as Partial<JsonSchemaObject>)
        .$ref;

      if (ref !== undefined) {
        let uri: Uri;

        try {
          uri = new Uri(ref, id);
        } catch (_error: unknown) {
          return undefined;
        }

        const uriSchema: JsonValue | undefined = resolveNonJsonPointer(
          uri.toString(),
        );

        if (uriSchema !== undefined) {
          return uriSchema;
        }

        if (
          uri.attributes.fragment === undefined ||
          !uri.attributes.fragment.startsWith(SEPARATOR)
        ) {
          return undefined;
        }

        const noFragmentUri: Uri = Uri.fromAttributes({
          authority: uri.attributes.authority,
          fragment: undefined,
          path: uri.attributes.path,
          query: uri.attributes.query,
          scheme: uri.attributes.scheme,
        });

        const noFragmentUriSchema: JsonValue | undefined =
          resolveNonJsonPointer(noFragmentUri.toString());

        if (noFragmentUriSchema === undefined) {
          return undefined;
        }

        return innerDeepResolveJsonSchemaPointer(
          noFragmentUriSchema,
          uri.attributes.fragment,
        );
      }
    }

    return result;
  }

  return innerDeepResolveJsonSchemaPointer;
}
