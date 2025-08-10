import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanParams } from '../models/PlanParams';

export function buildPlanBindingConstraintsList(
  params: PlanParams,
): SingleImmutableLinkedList<InternalBindingConstraints> {
  const tags: Map<MetadataTag, unknown> = new Map();

  if (params.rootConstraints.tag !== undefined) {
    tags.set(params.rootConstraints.tag.key, params.rootConstraints.tag.value);
  }

  return new SingleImmutableLinkedList({
    elem: {
      getAncestorsCalled: false,
      name: params.rootConstraints.name,
      serviceIdentifier: params.rootConstraints.serviceIdentifier,
      tags,
    },
    previous: undefined,
  });
}
