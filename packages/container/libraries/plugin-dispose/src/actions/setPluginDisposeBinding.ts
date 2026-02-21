import { type BindingDisposeMetadata } from '../models/BindingDisposeMetadata.js';
import { type SingletonScopedBinding } from '../models/SingletonScopedBinding.js';
import { getPluginDisposeBindingMap } from './getPluginDisposeBindingMap.js';

export function setPluginDisposeBinding(
  binding: SingletonScopedBinding,
  metadata: BindingDisposeMetadata,
): void {
  const map: Map<SingletonScopedBinding, BindingDisposeMetadata> =
    getPluginDisposeBindingMap();

  map.set(binding, metadata);
}
