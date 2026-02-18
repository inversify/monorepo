import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { getSelf } from '../../common/calculations/getSelf.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveScoped } from './resolveScoped.js';

export const resolveScopedBinding: <
  TActivated,
  TType extends BindingType,
  TBinding extends ScopedBinding<TType, BindingScope, TActivated>,
>(
  resolve: (
    params: ResolutionParams,
    binding: TBinding,
  ) => Resolved<TActivated>,
) => (params: ResolutionParams, binding: TBinding) => Resolved<TActivated> = <
  TActivated,
  TType extends BindingType,
  TBinding extends ScopedBinding<TType, BindingScope, TActivated>,
>(
  resolve: (
    params: ResolutionParams,
    binding: TBinding,
  ) => Resolved<TActivated>,
) => resolveScoped(getSelf, resolve);
