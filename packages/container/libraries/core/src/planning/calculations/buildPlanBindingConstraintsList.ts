import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type PlanParams } from '../models/PlanParams.js';

export function buildPlanBindingConstraintsList(
  params: PlanParams,
): SingleImmutableLinkedList<InternalBindingConstraints> {
  const tags: Map<MetadataTag, unknown> = new Map();

  if (params.rootConstraints.tag !== undefined) {
    tags.set(params.rootConstraints.tag.key, params.rootConstraints.tag.value);
  }

  return new SingleImmutableLinkedList(
    {
      elem: {
        getAncestorsCalled: false,
        name: params.rootConstraints.name,
        serviceIdentifier: params.rootConstraints.serviceIdentifier,
        tags,
      },
      previous: undefined,
    },
    1,
  );
}
