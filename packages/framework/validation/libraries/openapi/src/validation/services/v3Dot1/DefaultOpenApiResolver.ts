import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonRootSchemaObject,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import {
  JsonSchemaResolver,
  type TraverseJsonSchemaCallbackParams,
} from '@inversifyjs/json-schema-utils/2020-12';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import {
  OpenApi3Dot1Resolver,
  traverseOpenApiObjectJsonSchemas,
} from '@inversifyjs/open-api-utils/v3Dot1';
import { Uri } from '@inversifyjs/uri';

import { getClosestAncestorId } from '../../calculations/getClosestAncestorId.js';
import { BaseOpenApiResolver } from '../BaseOpenApiResolver.js';
import {
  type JsonSchemaResolutionResult,
  type OpenApiRefResolutionResult,
} from '../OpenApiResolver.js';

const OPEN_API_DOCUMENT_URI: string = 'urn:inversifyjs:openapi-v3dot1-spec';

export class DefaultOpenApiResolver extends BaseOpenApiResolver {
  readonly #jsonSchemaResolver: JsonSchemaResolver;
  readonly #openApi3Dot1Resolver: OpenApi3Dot1Resolver;
  readonly #openApiObject: JsonValue;
  readonly #uriToSchemaMap: Map<string, JsonValue>;

  constructor(openApiObject: OpenApi3Dot1Object) {
    super();

    this.#openApiObject = openApiObject as unknown as JsonValue;
    this.#uriToSchemaMap = new Map();

    this.#populateUriToSchemaMap(openApiObject);

    this.#jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
      this._maybeResolveUri(id),
    );
    this.#openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
      OPEN_API_DOCUMENT_URI,
      (id: string) => this.#maybeResolveOpenApiDocument(id),
    );
  }

  public resolveJsonSchema(schema: JsonValue): JsonSchemaResolutionResult {
    return this.#jsonSchemaResolver.resolveSchema(schema);
  }

  public resolveOpenApiReference(
    reference: JsonValue,
  ): OpenApiRefResolutionResult {
    return this.#openApi3Dot1Resolver.resolveRef(reference);
  }

  protected _maybeResolveUri(uri: string): JsonValue | undefined {
    return this.#uriToSchemaMap.get(uri);
  }

  #maybeResolveOpenApiDocument(uri: string): JsonValue | undefined {
    if (uri === OPEN_API_DOCUMENT_URI) {
      return this.#openApiObject;
    }

    return undefined;
  }

  #hasId(
    schema: JsonRootSchemaObject | JsonSchemaObject,
  ): schema is (JsonRootSchemaObject | JsonSchemaObject) & { $id: string } {
    return schema.$id !== undefined;
  }

  #populateUriToSchemaMap(openApiObject: OpenApi3Dot1Object): void {
    this.#uriToSchemaMap.set('', openApiObject as unknown as JsonValue);
    this.#uriToSchemaMap.set(
      OPEN_API_DOCUMENT_URI,
      openApiObject as unknown as JsonValue,
    );

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
            undefined,
          );
          const idUri: Uri = new Uri(params.schema.$id, baseId);

          this.#uriToSchemaMap.set(idUri.toString(), params.schema);
        }
      },
    );
  }
}
