import {
  type ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';

import { stringifyBinding } from '../../binding/calculations/stringifyBinding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';

const SINGLE_SERVICE_NODE_BINDINGS: number = 1;

export function throwErrorWhenUnexpectedBindingsAmountFound(
  bindingNodes: PlanBindingNode[] | PlanBindingNode | undefined,
  isOptional: boolean,
  bindingConstraintNode: SingleImmutableLinkedListNode<InternalBindingConstraints>,
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
    );
  } else {
    throwErrorWhenSingleUnexpectedBindingFound(
      bindingNodes,
      isOptional,
      serviceIdentifier,
      parentServiceIdentifier,
      bindingConstraintNode.elem,
    );
  }
}

function throwBindingNotFoundError(
  serviceIdentifier: ServiceIdentifier,
  parentServiceIdentifier: ServiceIdentifier | undefined,
  bindingConstraints: InternalBindingConstraints,
): never {
  const errorMessage: string = `No bindings found for service: "${stringifyServiceIdentifier(serviceIdentifier)}".

Trying to resolve bindings for "${stringifyParentServiceIdentifier(serviceIdentifier, parentServiceIdentifier)}".${stringifyBindingConstraints(bindingConstraints)}`;

  throw new InversifyCoreError(InversifyCoreErrorKind.planning, errorMessage);
}

function throwErrorWhenMultipleUnexpectedBindingsAmountFound(
  bindingNodes: PlanBindingNode[],
  isOptional: boolean,
  serviceIdentifier: ServiceIdentifier,
  parentServiceIdentifier: ServiceIdentifier | undefined,
  bindingConstraints: InternalBindingConstraints,
): void {
  if (bindingNodes.length === SINGLE_SERVICE_NODE_BINDINGS) {
    return;
  }

  if (bindingNodes.length === 0) {
    if (!isOptional) {
      throwBindingNotFoundError(
        serviceIdentifier,
        parentServiceIdentifier,
        bindingConstraints,
      );
    }
  } else {
    const errorMessage: string = `Ambiguous bindings found for service: "${stringifyServiceIdentifier(serviceIdentifier)}".

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
): void {
  if (bindingNode === undefined && !isOptional) {
    throwBindingNotFoundError(
      serviceIdentifier,
      parentServiceIdentifier,
      bindingConstraints,
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
