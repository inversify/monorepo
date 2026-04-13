import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type TraverseJsonSchemaParams } from '@inversifyjs/json-schema-utils/2020-12';
import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import { traverseOpenApiObjectJsonSchemas } from '@inversifyjs/open-api-utils/v3Dot2';

import { BaseOpenApiResolver } from '../BaseOpenApiResolver.js';

export class DefaultOpenApiResolver extends BaseOpenApiResolver {
  readonly #idToSchemaMap: Map<string, JsonValue>;

  constructor(openApiObject: OpenApi3Dot2Object) {
    super();

    this.#idToSchemaMap = new Map();

    this.#populateIdToSchemaMap(openApiObject);
  }

  protected _resolveId(id: string): JsonValue | undefined {
    return this.#idToSchemaMap.get(id);
  }

  #populateIdToSchemaMap(openApiObject: OpenApi3Dot2Object): void {
    this.#idToSchemaMap.set('', openApiObject as unknown as JsonValue);

    traverseOpenApiObjectJsonSchemas(
      openApiObject,
      (params: TraverseJsonSchemaParams) => {
        if (
          params.schema !== true &&
          params.schema !== false &&
          params.schema.$id !== undefined
        ) {
          this.#idToSchemaMap.set(params.schema.$id, params.schema);
        }
      },
    );
  }
}
