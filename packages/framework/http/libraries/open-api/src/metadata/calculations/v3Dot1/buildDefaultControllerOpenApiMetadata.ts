import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';

export function buildDefaultControllerOpenApiMetadata(): ControllerOpenApiMetadata {
  return {
    methodToPathItemObjectMap: new Map(),
    references: new Set(),
    servers: undefined,
    summary: undefined,
  };
}
