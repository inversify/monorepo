import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';

export function buildDynamicAnchorBindingsKey(
  nameToResourceMap: ReadonlyMap<string, JsonSchemaResource>,
): string {
  const keyPartList: string[] = [];

  for (const [name, resource] of nameToResourceMap) {
    keyPartList.push(`${name}:${resource.index.toString()}`);
  }

  /*
   * Sorting the rendered parts is equivalent to sorting by name: a name is
   * unique within the bindings and, being a plain name, contains neither the
   * pair nor the part separator.
   */
  return keyPartList.sort().join(',');
}
