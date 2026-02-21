import { type BindingDisposeMetadata } from '../models/BindingDisposeMetadata.js';
import { type SingletonScopedBinding } from '../models/SingletonScopedBinding.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP:
    | Map<SingletonScopedBinding, BindingDisposeMetadata>
    | undefined;
}

export function getPluginDisposeBindingMap(): Map<
  SingletonScopedBinding,
  BindingDisposeMetadata
> {
  if (globalThis.__INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP === undefined) {
    globalThis.__INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP = new Map();
  }

  return globalThis.__INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP;
}
