import { ReferencedSchemaMetadata } from './ReferencedSchemaMetadata';

export interface SchemaMetadata extends ReferencedSchemaMetadata {
  name: string | undefined;
  properties: Map<string, ReferencedSchemaMetadata>;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  references: Map<string, Function>;
}
