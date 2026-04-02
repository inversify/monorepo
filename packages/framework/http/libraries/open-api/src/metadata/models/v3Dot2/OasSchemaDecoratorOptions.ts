import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

export interface OasSchemaDecoratorOptions {
  customAttributes?: OpenApi3Dot2SchemaObject;
  name?: string;
}
