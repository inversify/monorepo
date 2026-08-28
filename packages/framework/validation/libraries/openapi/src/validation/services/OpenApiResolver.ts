import { type JsonValue } from '@inversifyjs/json-schema-types';

interface OpenApiRefResolutionContext {
  readonly $ref: string;
  readonly canonicalId: string;
}

interface OpenApiRefResolutionChainEntry extends OpenApiRefResolutionContext {
  readonly value: JsonValue;
}

interface OpenApiRefResolutionFailure {
  readonly reason: string;
  readonly resolutionContextStack: readonly OpenApiRefResolutionContext[];
}

interface OpenApiRefResolutionSuccess {
  readonly chain: readonly OpenApiRefResolutionChainEntry[];
  readonly value: JsonValue;
}

export type OpenApiRefResolutionResult =
  | {
      isRight: false;
      value: OpenApiRefResolutionFailure;
    }
  | {
      isRight: true;
      value: OpenApiRefResolutionSuccess;
    };

export interface OpenApiResolver {
  deepResolveReference(reference: string): JsonValue | undefined;
  resolveOpenApiReference(reference: JsonValue): OpenApiRefResolutionResult;
  resolveReference(reference: string): JsonValue | undefined;
}
