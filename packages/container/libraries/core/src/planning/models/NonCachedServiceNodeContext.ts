import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';

export interface NonCachedServiceNodeContext {
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>;
  chainedBindings: boolean;
  optionalBindings: boolean;
}
