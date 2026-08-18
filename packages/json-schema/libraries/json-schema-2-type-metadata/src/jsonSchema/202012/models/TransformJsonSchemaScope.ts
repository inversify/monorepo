import { type DynamicAnchorBindings } from './DynamicAnchorBindings.js';
import { type JsonSchemaResource } from './JsonSchemaResource.js';

export interface TransformJsonSchemaScope {
  dynamicAnchorBindings: DynamicAnchorBindings;
  resource: JsonSchemaResource;
}
