import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ToSchemaFunction = (type: Function) => OpenApi3Dot2SchemaObject;
