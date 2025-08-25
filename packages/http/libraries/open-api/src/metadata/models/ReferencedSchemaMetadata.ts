import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

export interface ReferencedSchemaMetadata {
  schema: OpenApi3Dot1SchemaObject | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  references: Map<string, Function>;
}
