import { type TypeMetadata } from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';
import { type DynamicScopeEntry } from '@inversifyjs/json-schema-utils/2020-12';

import { type TransformJsonSchemaContext } from './TransformJsonSchemaContext.js';

export interface TransformJsonSchemaInternalContext extends TransformJsonSchemaContext {
  dynamicScopeEntries: DynamicScopeEntry[];
  inProgressJsonSchemaToTypeMap: Map<
    JsonRootSchema | JsonSchema,
    Map<string, TypeMetadata>
  >;
  jsonSchemaToTypeMap: Map<
    JsonRootSchema | JsonSchema,
    Map<string, TypeMetadata>
  >;
  typeMetadataIdSet: Set<string>;
}
