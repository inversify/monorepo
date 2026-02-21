import { type SingletonScopedBinding } from './SingletonScopedBinding.js';

export interface BindingDisposeMetadata {
  dependendentBindings: Set<SingletonScopedBinding>;
}
