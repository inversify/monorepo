import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonRootSchemaObject,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { type TraverseJsonSchemaCallbackParams } from '@inversifyjs/json-schema-utils/2020-12';
import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import { traverseOpenApiObjectJsonSchemas } from '@inversifyjs/open-api-utils/v3Dot2';
import { Uri } from '@inversifyjs/uri';

import { getClosestAncestorId } from '../../calculations/getClosestAncestorId.js';
import { getClosestAncestorOrNodeId } from '../../calculations/getClosestAncestorOrNodeId.js';
import { BaseOpenApiResolver } from '../BaseOpenApiResolver.js';

export class DefaultOpenApiResolver extends BaseOpenApiResolver {
  readonly #uriToSchemaMap: Map<string, JsonValue>;

  constructor(openApiObject: OpenApi3Dot2Object) {
    super();

    this.#uriToSchemaMap = new Map();

    this.#populateUriToSchemaMap(openApiObject);
  }

  protected _maybeResolveUri(uri: string): JsonValue | undefined {
    return this.#uriToSchemaMap.get(uri);
  }

  #hasId(
    schema: JsonRootSchemaObject | JsonSchemaObject,
  ): schema is (JsonRootSchemaObject | JsonSchemaObject) & { $id: string } {
    return schema.$id !== undefined;
  }

  #populateUriToSchemaMap(openApiObject: OpenApi3Dot2Object): void {
    this.#uriToSchemaMap.set('', openApiObject as unknown as JsonValue);

    traverseOpenApiObjectJsonSchemas(
      openApiObject,
      (params: TraverseJsonSchemaCallbackParams) => {
        if (params.schema === true || params.schema === false) {
          return;
        }

        if (this.#hasId(params.schema)) {
          const baseId: string | undefined = getClosestAncestorId(
            params.rootSchema,
            params.jsonPointer,
            openApiObject.$self,
          );
          const idUri: Uri = new Uri(params.schema.$id, baseId);

          this.#uriToSchemaMap.set(idUri.toString(), params.schema);
        }

        if (params.schema.$anchor !== undefined) {
          const anchorRelatedId: string | undefined =
            getClosestAncestorOrNodeId(
              params.rootSchema,
              params.jsonPointer,
              openApiObject.$self,
            );

          if (anchorRelatedId !== undefined) {
            this.#uriToSchemaMap.set(
              `${anchorRelatedId}#${params.schema.$anchor}`,
              params.schema,
            );
          }
        }
      },
    );
  }
}
