import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type TraverseJsonSchemaParams } from '@inversifyjs/json-schema-utils/2020-12';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { traverseOpenApiObjectJsonSchemas } from '@inversifyjs/open-api-utils/v3Dot1';

import { BaseOpenApiResolver } from '../BaseOpenApiResolver.js';

export class DefaultOpenApiResolver extends BaseOpenApiResolver {
  readonly #idToSchemaMap: Map<string, JsonValue>;

  constructor(openApiObject: OpenApi3Dot1Object) {
    super();

    this.#idToSchemaMap = new Map();

    this.#populateIdToSchemaMap(openApiObject);
  }

  protected _resolveId(id: string): JsonValue | undefined {
    return this.#idToSchemaMap.get(id);
  }

  #populateIdToSchemaMap(openApiObject: OpenApi3Dot1Object): void {
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
