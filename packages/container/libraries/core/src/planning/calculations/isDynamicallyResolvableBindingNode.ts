import { type Binding } from '../../binding/models/Binding.js';
import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from '../models/DynamicallyResolvableBindingNode.js';
import { type ResolvableBindingNode } from '../models/ResolvableBindingNode.js';

export function isDynamicallyResolvableBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends Binding<TActivated> = Binding<TActivated>,
>(
  node: ResolvableBindingNode<TActivated, TBinding>,
): node is DynamicallyResolvableBindingNode<TActivated, TBinding> {
  return (
    (node as Partial<DynamicallyResolvableBindingNode<TActivated, TBinding>>)[
      isDynamicallyResolvableBindingNodeSymbol
    ] === true
  );
}
