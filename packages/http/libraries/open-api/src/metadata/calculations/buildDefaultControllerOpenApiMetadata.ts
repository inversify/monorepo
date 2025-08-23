import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';

export function buildDefaultControllerOpenApiMetadata(): ControllerOpenApiMetadata {
  return {
    methodToPathItemObjectMap: new Map(),
    servers: undefined,
    summary: undefined,
  };
}
