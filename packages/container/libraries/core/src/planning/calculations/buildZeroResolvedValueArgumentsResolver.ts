import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

export function buildZeroResolvedValueArgumentsResolver<TActivated>(
  factory: () => Resolved<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = getGeneratedResolverId().toString();

  const buildResolveNode: (
    boundFactory: () => Resolved<TActivated>,
    activate: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `factory$${id}`,
    `activate$${id}`,
    `return function resolveNode$${id}(params$${id}) {
      return activate$${id}(params$${id}, factory$${id}());
    };`,
  ) as (
    factory: () => Resolved<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(factory, resolveActivations);
}
