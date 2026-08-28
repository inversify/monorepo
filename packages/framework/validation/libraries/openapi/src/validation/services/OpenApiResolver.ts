import { type JsonValue } from '@inversifyjs/json-schema-types';

export interface OpenApiRefResolutionContext {
  readonly $ref: string;
  readonly canonicalId: string;
}

export interface OpenApiRefResolutionChainEntry extends OpenApiRefResolutionContext {
  readonly value: JsonValue;
}

export interface OpenApiRefResolutionFailure {
  readonly reason: string;
  readonly resolutionContextStack: readonly OpenApiRefResolutionContext[];
}

export interface OpenApiRefResolutionSuccess {
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
