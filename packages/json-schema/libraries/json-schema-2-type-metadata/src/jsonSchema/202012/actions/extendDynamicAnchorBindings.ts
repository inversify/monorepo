import { type DynamicAnchorBindings } from '../models/DynamicAnchorBindings.js';
import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { buildDynamicAnchorBindingsKey } from './buildDynamicAnchorBindingsKey.js';

/**
 * Adds a resource entering the dynamic scope to the bindings.
 *
 * Names already bound are left untouched. Bindings are only ever extended
 * while descending, so the first resource to bind a name is the outermost one
 * declaring it, which is the resource `$dynamicRef` resolves to. Keeping the
 * first binding also makes re entering a resource a no op, which is what
 * bounds recursion over recursive dynamic references.
 */
export function extendDynamicAnchorBindings(
  bindings: DynamicAnchorBindings,
  resource: JsonSchemaResource,
): DynamicAnchorBindings {
  let nameToResourceMap: Map<string, JsonSchemaResource> | undefined;

  for (const name of resource.dynamicAnchorMap.keys()) {
    if (!bindings.nameToResourceMap.has(name)) {
      nameToResourceMap ??= new Map(bindings.nameToResourceMap);
      nameToResourceMap.set(name, resource);
    }
  }

  if (nameToResourceMap === undefined) {
    return bindings;
  }

  return {
    key: buildDynamicAnchorBindingsKey(nameToResourceMap),
    nameToResourceMap,
  };
}
