import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ServerObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { type SchemaReferencesMetadata } from '../SchemaReferencesMetadata.js';

export interface ControllerOpenApiMetadata extends SchemaReferencesMetadata {
  methodToOperationObjectMap: Map<string | symbol, OpenApi3Dot2OperationObject>;
  servers: OpenApi3Dot2ServerObject[] | undefined;
  summary: string | undefined;
}
