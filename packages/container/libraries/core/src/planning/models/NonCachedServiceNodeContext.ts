import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type BuildServiceNodeOptions } from './BuildServiceNodeOptions.js';

export interface NonCachedServiceNodeContext {
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>;
  buildServiceNodeOptions: BuildServiceNodeOptions;
}
