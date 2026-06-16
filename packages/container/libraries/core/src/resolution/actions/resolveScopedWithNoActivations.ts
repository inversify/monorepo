import { type Binding } from '../../binding/models/Binding.js';
import {
  type BindingScope,
  bindingScopeValues,
} from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type BaseBindingNode } from '../../planning/models/BaseBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { cacheResolvedValue } from './cacheResolvedValue.js';

export function resolveScopedWithNoActivations<
  TActivated,
  TType extends BindingType,
  TBinding extends ScopedBinding<TType, BindingScope, TActivated> &
    Binding<TActivated>,
  TNode extends BaseBindingNode<TBinding>,
>(
  node: TNode,
  resolve: (params: ResolutionParams, node: TNode) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const binding: TBinding = node.binding;

  switch (binding.scope) {
    case bindingScopeValues.Singleton: {
      return (params: ResolutionParams): Resolved<TActivated> => {
        if (binding.cache.isRight) {
          return binding.cache.value;
        }

        const resolvedValue: Resolved<TActivated> = resolve(params, node);

        return cacheResolvedValue(binding, resolvedValue);
      };
    }
    case bindingScopeValues.Request: {
      return (params: ResolutionParams): Resolved<TActivated> => {
        if (params.requestScopeCache.has(binding.id)) {
          return params.requestScopeCache.get(
            binding.id,
          ) as Resolved<TActivated>;
        }

        const resolvedValue: Resolved<TActivated> = resolve(params, node);

        params.requestScopeCache.set(binding.id, resolvedValue);

        return resolvedValue;
      };
    }
    case bindingScopeValues.Transient:
      return (params: ResolutionParams): Resolved<TActivated> =>
        resolve(params, node);
  }
}
