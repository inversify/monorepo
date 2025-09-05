import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

export interface OasSchemaDecoratorOptions {
  customAttributes?: OpenApi3Dot1SchemaObject;
  name?: string;
}
