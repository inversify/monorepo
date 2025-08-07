import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleInmutableLinkedList } from '../../common/models/SingleInmutableLinkedList';

export interface NonCachedServiceNodeContext {
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>;
  chainedBindings: boolean;
  optionalBindings: boolean;
}
