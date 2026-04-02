import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';

export function buildDefaultControllerOpenApiMetadata(): ControllerOpenApiMetadata {
  return {
    methodToOperationObjectMap: new Map(),
    references: new Set(),
    servers: undefined,
    summary: undefined,
  };
}
