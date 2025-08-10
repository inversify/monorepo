import {
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';

import { stringifyBinding } from '../../binding/calculations/stringifyBinding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanBindingNode } from '../models/PlanBindingNode';

export function throwErrorWhenUnexpectedBindingsAmountFound(
  bindingNodes: PlanBindingNode[] | PlanBindingNode | undefined,
  isOptional: boolean,
  bindingConstraintNode: SingleImmutableLinkedListNode<InternalBindingConstraints>,
  serviceRedirections: readonly ServiceIdentifier[],
): void {
  const serviceIdentifier: ServiceIdentifier =
    bindingConstraintNode.elem.serviceIdentifier;
  const parentServiceIdentifier: ServiceIdentifier | undefined =
    bindingConstraintNode.previous?.elem.serviceIdentifier;

  if (Array.isArray(bindingNodes)) {
    throwErrorWhenMultipleUnexpectedBindingsAmountFound(
      bindingNodes,
      isOptional,
      serviceIdentifier,
      parentServiceIdentifier,
      bindingConstraintNode.elem,
      serviceRedirections,
    );
  } else {
    throwErrorWhenSingleUnexpectedBindingFound(
      bindingNodes,
      isOptional,
      serviceIdentifier,
      parentServiceIdentifier,
      bindingConstraintNode.elem,
      serviceRedirections,
    );
  }
}

function throwBindingNotFoundError(
  serviceIdentifier: ServiceIdentifier,
  parentServiceIdentifier: ServiceIdentifier | undefined,
  bindingConstraints: InternalBindingConstraints,
  serviceRedirections: readonly ServiceIdentifier[],
): never {
  const lastResolvedServiceIdentifier: ServiceIdentifier =
    serviceRedirections[serviceRedirections.length - 1] ?? serviceIdentifier;

  const errorMessage: string = `No bindings found for service: "${stringifyServiceIdentifier(lastResolvedServiceIdentifier)}".

Trying to resolve bindings for "${stringifyParentServiceIdentifier(serviceIdentifier, parentServiceIdentifier)}".${stringifyServiceRedirections(serviceRedirections)}${stringifyBindingConstraints(bindingConstraints)}`;

  throw new InversifyCoreError(InversifyCoreErrorKind.planning, errorMessage);
}

function throwErrorWhenMultipleUnexpectedBindingsAmountFound(
  bindingNodes: PlanBindingNode[],
  isOptional: boolean,
  serviceIdentifier: ServiceIdentifier,
  parentServiceIdentifier: ServiceIdentifier | undefined,
  bindingConstraints: InternalBindingConstraints,
  serviceRedirections: readonly ServiceIdentifier[],
): void {
  if (bindingNodes.length === 0) {
    if (!isOptional) {
      throwBindingNotFoundError(
        serviceIdentifier,
        parentServiceIdentifier,
        bindingConstraints,
        serviceRedirections,
      );
    }
  } else {
    const lastResolvedServiceIdentifier: ServiceIdentifier =
      serviceRedirections[serviceRedirections.length - 1] ?? serviceIdentifier;

    const errorMessage: string = `Ambiguous bindings found for service: "${stringifyServiceIdentifier(lastResolvedServiceIdentifier)}".${stringifyServiceRedirections(serviceRedirections)}

Registered bindings:

${bindingNodes.map((bindingNode: PlanBindingNode): string => stringifyBinding(bindingNode.binding)).join('\n')}

Trying to resolve bindings for "${stringifyParentServiceIdentifier(serviceIdentifier, parentServiceIdentifier)}".${stringifyBindingConstraints(bindingConstraints)}`;

    throw new InversifyCoreError(InversifyCoreErrorKind.planning, errorMessage);
  }
}

function throwErrorWhenSingleUnexpectedBindingFound(
  bindingNode: PlanBindingNode | undefined,
  isOptional: boolean,
  serviceIdentifier: ServiceIdentifier,
  parentServiceIdentifier: ServiceIdentifier | undefined,
  bindingConstraints: InternalBindingConstraints,
  serviceRedirections: readonly ServiceIdentifier[],
): void {
  if (bindingNode === undefined && !isOptional) {
    throwBindingNotFoundError(
      serviceIdentifier,
      parentServiceIdentifier,
      bindingConstraints,
      serviceRedirections,
    );
  }
}

function stringifyParentServiceIdentifier(
  serviceIdentifier: ServiceIdentifier,
  parentServiceIdentifier: ServiceIdentifier | undefined,
): string {
  return parentServiceIdentifier === undefined
    ? `${stringifyServiceIdentifier(serviceIdentifier)} (Root service)`
    : stringifyServiceIdentifier(parentServiceIdentifier);
}

function stringifyBindingConstraints(
  bindingConstraints: InternalBindingConstraints,
): string {
  const stringifiedTags: string =
    bindingConstraints.tags.size === 0
      ? ''
      : `
- tags:
  - ${[...bindingConstraints.tags.keys()].map((key: MetadataTag) => key.toString()).join('\n  - ')}`;

  return `

Binding constraints:
- service identifier: ${stringifyServiceIdentifier(bindingConstraints.serviceIdentifier)}
- name: ${bindingConstraints.name?.toString() ?? '-'}${stringifiedTags}`;
}

function stringifyServiceRedirections(
  serviceRedirections: readonly ServiceIdentifier[],
): string {
  return serviceRedirections.length === 0
    ? ''
    : `

- service redirections:
  - ${serviceRedirections
    .map((serviceIdentifier: ServiceIdentifier) =>
      stringifyServiceIdentifier(serviceIdentifier),
    )
    .join('\n  - ')}`;
}
