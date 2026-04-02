import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type BuildOpenApiBlockFunction } from '../../models/v3Dot2/BuildOpenApiBlockFunction.js';
import { BaseOasSchemaProperty } from './BaseOasSchemaProperty.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasSchemaProperty(
  schema?:
    | OpenApi3Dot2SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot2SchemaObject>,
): PropertyDecorator {
  return BaseOasSchemaProperty(true)(schema);
}
