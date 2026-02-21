import { type BindingDisposeMetadata } from '../models/BindingDisposeMetadata.js';
import { type SingletonScopedBinding } from '../models/SingletonScopedBinding.js';
import { getPluginDisposeBindingMap } from './getPluginDisposeBindingMap.js';

export function getPluginDisposeBinding(
  binding: SingletonScopedBinding,
): BindingDisposeMetadata | undefined {
  const map: Map<SingletonScopedBinding, BindingDisposeMetadata> =
    getPluginDisposeBindingMap();

  return map.get(binding);
}
