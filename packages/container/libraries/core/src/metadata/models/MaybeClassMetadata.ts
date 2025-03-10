import { BindingScope } from '../../binding/models/BindingScope';
import { ClassMetadataLifecycle } from './ClassMetadataLifecycle';
import { MaybeClassElementMetadata } from './MaybeClassElementMetadata';

export interface MaybeClassMetadata {
  constructorArguments: MaybeClassElementMetadata[];
  lifecycle: ClassMetadataLifecycle;
  properties: Map<string | symbol, MaybeClassElementMetadata>;
  scope: BindingScope | undefined;
}
