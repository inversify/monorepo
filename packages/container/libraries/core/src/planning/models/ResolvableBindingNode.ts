import { type Binding } from '../../binding/models/Binding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type BaseBindingNode } from './BaseBindingNode.js';

export interface ResolvableBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends Binding<TActivated> = Binding<TActivated>,
> extends BaseBindingNode<TBinding> {
  readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;
}
