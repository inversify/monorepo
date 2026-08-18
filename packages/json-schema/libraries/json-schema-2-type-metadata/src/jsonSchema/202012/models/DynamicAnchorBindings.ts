import { type JsonSchemaResource } from './JsonSchemaResource.js';

/**
 * The dynamic scope, collapsed into the answer `$dynamicRef` asks it for: the
 * outermost resource declaring each `$dynamicAnchor` name.
 *
 * `key` is a canonical, order independent rendering of `nameToResourceMap`,
 * suitable for memoization.
 */
export interface DynamicAnchorBindings {
  key: string;
  nameToResourceMap: ReadonlyMap<string, JsonSchemaResource>;
}
