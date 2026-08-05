import { type JsonValue } from '@inversifyjs/json-schema-types';

import { deepResolveJsonSchemaPointer } from '../calculations/deepResolveJsonSchemaPointer.js';
import { type OpenApiResolver } from './OpenApiResolver.js';

const URI_SPLIT_BY_FRAGMENT_PARTS_COUNT: number = 2;

export abstract class BaseOpenApiResolver implements OpenApiResolver {
  readonly #deepResolveJsonSchemaPointer: (
    schema: JsonValue,
    pointer: string,
  ) => JsonValue | undefined;

  constructor() {
    this.#deepResolveJsonSchemaPointer = deepResolveJsonSchemaPointer(
      (uri: string) => this._maybeResolveUri(uri),
    );
  }

  public deepResolveReference(reference: string): JsonValue | undefined {
    let resolved: JsonValue | undefined = this.resolveReference(reference);

    while (this.#isReferenceObject(resolved)) {
      resolved = this.resolveReference(resolved.$ref);
    }

    return resolved;
  }

  public resolveReference(reference: string): JsonValue | undefined {
    const uriParts: [string, string?] = reference.split('#') as [
      string,
      string?,
    ];

    if (uriParts.length > URI_SPLIT_BY_FRAGMENT_PARTS_COUNT) {
      throw new Error(
        `Invalid reference "${reference}". A reference must be a URI with at most one fragment identifier.`,
      );
    }

    const uriSchema: JsonValue | undefined = this._maybeResolveUri(reference);

    if (uriSchema !== undefined) {
      return uriSchema;
    }

    const [id, fragment]: [string, string?] = uriParts;

    const idSchema: JsonValue | undefined = this._maybeResolveUri(id);

    if (idSchema === undefined || fragment === undefined) {
      return idSchema;
    }

    return this.#deepResolveJsonSchemaPointer(idSchema, fragment);
  }

  #isReferenceObject(object: unknown): object is { $ref: string } {
    return (
      typeof object === 'object' &&
      object !== null &&
      '$ref' in object &&
      typeof object.$ref === 'string'
    );
  }

  protected abstract _maybeResolveUri(uri: string): JsonValue | undefined;
}
