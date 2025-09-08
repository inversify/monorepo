import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { BaseOasSchemaProperty } from './BaseOasSchemaProperty';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasSchemaProperty(
  schema?:
    | OpenApi3Dot1SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>,
): PropertyDecorator {
  return BaseOasSchemaProperty(true)(schema);
}
