import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';

export function buildJsonSchemaResource(
  context: TransformJsonSchemaContext,
): JsonSchemaResource {
  const resource: JsonSchemaResource = {
    anchorMap: new Map(),
    dynamicAnchorMap: new Map(),
    index: context.resourceList.length,
  };

  context.resourceList.push(resource);

  return resource;
}
