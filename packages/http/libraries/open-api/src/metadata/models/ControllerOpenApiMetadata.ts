import {
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1ServerObject,
} from '@inversifyjs/open-api-types/v3Dot1';

export interface ControllerOpenApiMetadata {
  methodToPathItemObjectMap: Map<string | symbol, OpenApi3Dot1OperationObject>;
  servers: OpenApi3Dot1ServerObject[] | undefined;
  summary: string | undefined;
}
