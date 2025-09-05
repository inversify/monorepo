import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';

export function buildDefaultControllerOpenApiMetadata(): ControllerOpenApiMetadata {
  return {
    methodToPathItemObjectMap: new Map(),
    references: new Set(),
    servers: undefined,
    summary: undefined,
  };
}
