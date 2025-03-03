import { ResolutionContext } from '../../resolution/models/ResolutionContext';
import { Resolved } from '../../resolution/models/Resolved';

export type DynamicValueBuilder<T> = (
  context: ResolutionContext,
) => Resolved<T>;
