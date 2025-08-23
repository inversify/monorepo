import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';

export function buildDefaultControllerOpenApiMetadata(): ControllerOpenApiMetadata {
  return {
    methodToPathItemObjectMap: new Map(),
    summary: undefined,
  };
}
