import {
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';

import { bindingTypeValues } from '../../binding/models/BindingType';
import { isStackOverflowError } from '../../error/calculations/isStackOverflowError';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ResolutionParams } from '../../resolution/models/ResolutionParams';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';

const INDEX_NOT_FOUND: number = -1;

export function handleResolveError(
  params: ResolutionParams,
  error: unknown,
): never {
  if (isStackOverflowError(error)) {
    const stringifiedCircularDependencies: string =
      stringifyServiceIdentifierTrace(extractLikelyCircularDependency(params));

    throw new InversifyCoreError(
      InversifyCoreErrorKind.planning,
      `Circular dependency found: ${stringifiedCircularDependencies}`,
      { cause: error },
    );
  }

  throw error;
}

function extractLikelyCircularDependency(
  params: ResolutionParams,
): ServiceIdentifier[] {
  const root: PlanServiceNode = params.planResult.tree.root;

  const stack: PlanServiceNode[] = [];

  function depthFirstSearch(
    node: PlanServiceNode,
  ): ServiceIdentifier[] | undefined {
    const existingIndex: number = stack.indexOf(node);

    if (existingIndex !== INDEX_NOT_FOUND) {
      const cycleNodes: PlanServiceNode[] = [
        ...stack.slice(existingIndex),
        node,
      ];
      return cycleNodes.map((n: PlanServiceNode) => n.serviceIdentifier);
    }

    stack.push(node);

    try {
      for (const child of getChildServiceNodes(node)) {
        const result: ServiceIdentifier[] | undefined = depthFirstSearch(child);
        if (result !== undefined) {
          return result;
        }
      }
    } finally {
      stack.pop();
    }

    return undefined;
  }

  const result: ServiceIdentifier[] | undefined = depthFirstSearch(root);

  return result ?? [];
}

function getChildServiceNodes(serviceNode: PlanServiceNode): PlanServiceNode[] {
  const children: PlanServiceNode[] = [];
  const bindings: PlanBindingNode | PlanBindingNode[] | undefined =
    serviceNode.bindings;

  if (bindings === undefined) {
    return children;
  }

  const processBindingNode: (bindingNode: PlanBindingNode) => void = (
    bindingNode: PlanBindingNode,
  ): void => {
    if (isPlanServiceRedirectionBindingNode(bindingNode)) {
      for (const redirection of bindingNode.redirections) {
        processBindingNode(redirection);
      }
      return;
    }

    switch (bindingNode.binding.type) {
      case bindingTypeValues.Instance: {
        const instanceNode: InstanceBindingNode =
          bindingNode as InstanceBindingNode;
        for (const ctorParam of instanceNode.constructorParams) {
          if (ctorParam !== undefined) {
            children.push(ctorParam);
          }
        }
        for (const propParam of instanceNode.propertyParams.values()) {
          children.push(propParam);
        }
        break;
      }
      case bindingTypeValues.ResolvedValue: {
        const resolvedValueNode: ResolvedValueBindingNode =
          bindingNode as ResolvedValueBindingNode;
        for (const param of resolvedValueNode.params) {
          children.push(param);
        }
        break;
      }
      default:
        break;
    }
  };

  if (Array.isArray(bindings)) {
    for (const bindingNode of bindings) {
      processBindingNode(bindingNode);
    }
  } else {
    processBindingNode(bindings);
  }

  return children;
}

function stringifyServiceIdentifierTrace(
  serviceIdentifiers: Iterable<ServiceIdentifier>,
): string {
  const serviceIdentifiersArray: ServiceIdentifier[] = [...serviceIdentifiers];

  if (serviceIdentifiersArray.length === 0) {
    return '(No dependency trace)';
  }

  return serviceIdentifiersArray.map(stringifyServiceIdentifier).join(' -> ');
}
