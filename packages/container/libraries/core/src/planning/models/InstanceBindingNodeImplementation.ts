import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildInstanceBindingNodeResolver } from '../calculations/buildInstanceBindingNodeResolver.js';
import { type InstanceBindingNode } from './InstanceBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export class InstanceBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
> implements InstanceBindingNode<TActivated, InstanceBinding<TActivated>> {
  public readonly constructorParams: (PlanServiceNode | undefined)[];
  public readonly propertyParams: Map<string | symbol, PlanServiceNode>;
  public readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(
    public readonly binding: InstanceBinding<TActivated>,
    public readonly classMetadata: ClassMetadata,
  ) {
    this.constructorParams = [];
    this.propertyParams = new Map();
    this.resolve = buildInstanceBindingNodeResolver(
      binding,
      classMetadata,
      this,
    );
  }
}
