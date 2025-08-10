import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';

export interface NonCachedServiceNodeContext {
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>;
  chainedBindings: boolean;
  optionalBindings: boolean;
}
