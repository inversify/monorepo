import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type BaseBindingNode } from './BaseBindingNode.js';

export interface FactoryBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated extends Factory<unknown> = any,
  TBinding extends FactoryBinding<TActivated> = FactoryBinding<TActivated>,
> extends BaseBindingNode<TBinding> {
  readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;
}
