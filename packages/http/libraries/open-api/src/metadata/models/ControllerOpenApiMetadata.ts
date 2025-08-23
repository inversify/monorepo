import { OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

export interface ControllerOpenApiMetadata {
  methodToPathItemObjectMap: Map<string | symbol, OpenApi3Dot1OperationObject>;
  summary: string | undefined;
}
