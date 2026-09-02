import {
  transformJsonSchema,
  type TransformJsonSchemaContext,
} from '@inversifyjs/json-schema-2-type-metadata/2020-12';
import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { transformTypeMetadataToTypeScript } from '../../../typescript/actions/transformTypeMetadataToTypeScript.js';
import { type TransformTypeMetadataToTypeScriptOptions } from '../../../typescript/models/TransformTypeMetadataToTypeScriptOptions.js';

export function transformJsonSchemaToTypeScript(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
  options?: TransformTypeMetadataToTypeScriptOptions,
): string {
  return transformTypeMetadataToTypeScript(
    transformJsonSchema(schema, context),
    options,
  );
}
