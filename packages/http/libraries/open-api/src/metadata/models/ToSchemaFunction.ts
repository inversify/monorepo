import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ToSchemaFunction = (type: Function) => OpenApi3Dot1SchemaObject;
