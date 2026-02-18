import { type ResolutionContext } from '../../resolution/models/ResolutionContext.js';
import { type Resolved } from '../../resolution/models/Resolved.js';

export type BindingActivation<T = unknown> = (
  context: ResolutionContext,
  injectable: T,
) => Resolved<T>;
