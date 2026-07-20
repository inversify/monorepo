import { type Binding } from '../../binding/models/Binding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvableBindingNode } from './ResolvableBindingNode.js';

export const isDynamicallyResolvableBindingNodeSymbol: unique symbol =
  Symbol.for('@inversifyjs/core/DynamicallyResolvableBindingNode');

export interface DynamicallyResolvableBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends Binding<TActivated> = Binding<TActivated>,
> extends ResolvableBindingNode<TActivated, TBinding> {
  [isDynamicallyResolvableBindingNodeSymbol]: true;
  addOnResolverChangedHandler(
    callback: (
      newResolver: (params: ResolutionParams) => Resolved<TActivated>,
    ) => void,
  ): void;
}
