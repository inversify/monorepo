import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type ClassElementMetadata } from './ClassElementMetadata.js';
import { type ClassMetadataLifecycle } from './ClassMetadataLifecycle.js';

export interface ClassMetadata {
  constructorArguments: ClassElementMetadata[];
  lifecycle: ClassMetadataLifecycle;
  properties: Map<string | symbol, ClassElementMetadata>;
  scope: BindingScope | undefined;
}
