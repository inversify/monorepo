import { type ResolutionContext } from '../../resolution/models/ResolutionContext.js';
import { type Resolved } from '../../resolution/models/Resolved.js';

export type DynamicValueBuilder<T> = (
  context: ResolutionContext,
) => Resolved<T>;
