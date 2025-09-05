import {
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1ServerObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaReferencesMetadata } from './SchemaReferencesMetadata';

export interface ControllerOpenApiMetadata extends SchemaReferencesMetadata {
  methodToPathItemObjectMap: Map<string | symbol, OpenApi3Dot1OperationObject>;
  servers: OpenApi3Dot1ServerObject[] | undefined;
  summary: string | undefined;
}
