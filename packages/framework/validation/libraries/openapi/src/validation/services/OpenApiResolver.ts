import { type JsonValue } from '@inversifyjs/json-schema-types';

export interface OpenApiResolver {
  deepResolveReference(reference: string): JsonValue | undefined;
  resolveReference(reference: string): JsonValue | undefined;
}
