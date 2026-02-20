import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type ClassMetadataLifecycle } from './ClassMetadataLifecycle.js';
import { type MaybeClassElementMetadata } from './MaybeClassElementMetadata.js';

export interface MaybeClassMetadata {
  constructorArguments: MaybeClassElementMetadata[];
  lifecycle: ClassMetadataLifecycle;
  properties: Map<string | symbol, MaybeClassElementMetadata>;
  scope: BindingScope | undefined;
}
