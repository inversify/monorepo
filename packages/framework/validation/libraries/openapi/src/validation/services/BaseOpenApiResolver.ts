import { type JsonValue } from '@inversifyjs/json-schema-types';

import {
  type JsonSchemaResolutionResult,
  type OpenApiRefResolutionResult,
  type OpenApiResolver,
} from './OpenApiResolver.js';

export abstract class BaseOpenApiResolver implements OpenApiResolver {
  public abstract resolveJsonSchema(
    schema: JsonValue,
  ): JsonSchemaResolutionResult;

  public abstract resolveOpenApiReference(
    reference: JsonValue,
  ): OpenApiRefResolutionResult;

  protected abstract _maybeResolveUri(uri: string): JsonValue | undefined;
}
