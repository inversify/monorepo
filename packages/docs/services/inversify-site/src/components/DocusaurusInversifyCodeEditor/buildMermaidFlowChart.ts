import { ServiceIdentifier } from '@inversifyjs/common';
import {
  GetPlanOptions,
  InstanceBindingNode,
  LeafBindingNode,
  PlanBindingNode,
  PlanResult,
  PlanServiceNode,
  PlanServiceRedirectionBindingNode,
  ResolvedValueBindingNode,
} from '@inversifyjs/core';
import { Cloneable, CloneableFunction } from '@inversifyjs/react-code-runner';

/**
 * Escapes a string to be safely used in Mermaid diagrams.
 * Mermaid has special characters that need to be escaped or removed.
 */
function escapeMermaidString(str: string): string {
  return str
    .replace(/\n/g, '<br />') // Replace newlines
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\t/g, '  ') // Replace tabs with spaces
    .replace(/([[\]{}\\"<>])/g, '\\$1'); // Escape brackets and braces
}

/**
 * Converts a service identifier to a readable string.
 */
function serviceIdentifierToString(
  serviceIdentifier: ServiceIdentifier | CloneableFunction,
): string {
  if (typeof serviceIdentifier === 'string') {
    return serviceIdentifier;
  } else if (typeof serviceIdentifier === 'symbol') {
    return serviceIdentifier.toString();
  } else if (
    typeof serviceIdentifier === 'function' ||
    typeof serviceIdentifier === 'object'
  ) {
    return serviceIdentifier.name === ''
      ? 'AnonymousFunction'
      : serviceIdentifier.name;
  }
  return 'Unknown';
}

/**
 * Generates a unique node ID for Mermaid.
 */
function generateNodeId(prefix: string, id: number): string {
  return `${prefix}_${String(id)}`;
}

/**
 * Checks if a node is an InstanceBindingNode.
 */
function isInstanceBindingNodeCloneable(
  node: Cloneable<PlanBindingNode>,
): node is Cloneable<InstanceBindingNode> {
  return 'classMetadata' in node && 'constructorParams' in node;
}

/**
 * Checks if a node is a ResolvedValueBindingNode.
 */
function isResolvedValueBindingNode(
  node: Cloneable<PlanBindingNode>,
): node is Cloneable<ResolvedValueBindingNode> {
  return 'params' in node && !('classMetadata' in node);
}

/**
 * Checks if a node is a PlanServiceRedirectionBindingNode.
 */
function isServiceRedirectionBindingNode(
  node: Cloneable<PlanBindingNode>,
): node is Cloneable<PlanServiceRedirectionBindingNode> {
  return 'redirections' in node;
}

/**
 * Checks if a node is a LeafBindingNode.
 */
function isLeafBindingNode(
  node: Cloneable<PlanBindingNode>,
): node is Cloneable<LeafBindingNode> {
  return (
    !isInstanceBindingNodeCloneable(node) &&
    !isResolvedValueBindingNode(node) &&
    !isServiceRedirectionBindingNode(node)
  );
}

const MAX_VALUE_PREVIEW_LENGTH: number = 30;

export default function buildMermaidFlowChart(
  options: Cloneable<GetPlanOptions>,
  planResult: Cloneable<PlanResult>,
): string {
  const lines: string[] = ['flowchart TD'];
  let nodeCounter: number = 0;
  const nodeIdMap: Map<unknown, string> = new Map<unknown, string>();

  /**
   * Gets or creates a node ID for a given object.
   */
  function getOrCreateNodeId(obj: unknown, prefix: string): string {
    const existingId: string | undefined = nodeIdMap.get(obj);
    if (existingId === undefined) {
      const newId: string = generateNodeId(prefix, nodeCounter++);
      nodeIdMap.set(obj, newId);
      return newId;
    }
    return existingId;
  }

  /**
   * Processes a PlanServiceNode and its bindings.
   */
  function processServiceNode(serviceNode: Cloneable<PlanServiceNode>): string {
    const nodeId: string = getOrCreateNodeId(serviceNode, 'service');
    const serviceIdStr: string = escapeMermaidString(
      serviceIdentifierToString(serviceNode.serviceIdentifier),
    );

    lines.push(
      `${nodeId}["ServiceNode<br/>Service identifier: ${serviceIdStr}<br/>Is context free: ${String(serviceNode.isContextFree)}"]`,
    );

    // Process bindings
    if (serviceNode.bindings !== undefined) {
      if (Array.isArray(serviceNode.bindings)) {
        for (const binding of serviceNode.bindings) {
          processBindingNode(binding, nodeId);
        }
      } else {
        processBindingNode(serviceNode.bindings, nodeId);
      }
    }

    return nodeId;
  }

  /**
   * Processes a PlanBindingNode based on its type.
   */
  function processBindingNode(
    bindingNode: Cloneable<PlanBindingNode>,
    parentNodeId: string,
  ): void {
    if (isInstanceBindingNodeCloneable(bindingNode)) {
      processInstanceBindingNode(bindingNode, parentNodeId);
    } else if (isResolvedValueBindingNode(bindingNode)) {
      processResolvedValueBindingNode(bindingNode, parentNodeId);
    } else if (isServiceRedirectionBindingNode(bindingNode)) {
      processServiceRedirectionBindingNode(bindingNode, parentNodeId);
    } else if (isLeafBindingNode(bindingNode)) {
      processLeafBindingNode(bindingNode, parentNodeId);
    }
  }

  /**
   * Processes an InstanceBindingNode (class instantiation).
   */
  function processInstanceBindingNode(
    node: Cloneable<InstanceBindingNode>,
    parentNodeId: string,
  ): void {
    const nodeId: string = getOrCreateNodeId(node, 'instance');
    const bindingType: string = node.binding.type;
    const className: string = node.binding.implementationType.name;

    const escapedClassName: string = escapeMermaidString(className);

    lines.push(
      `${nodeId}["${bindingType}: ${escapedClassName}<br/>Binding scope: ${node.binding.scope}"]`,
    );
    lines.push(`${parentNodeId} --> ${nodeId}`);

    // Process constructor parameters
    for (let i: number = 0; i < node.constructorParams.length; i++) {
      const param: PlanServiceNode | Cloneable<PlanServiceNode> | undefined =
        node.constructorParams[i];
      if (param !== undefined) {
        const paramNodeId: string = processServiceNode(param);
        lines.push(`${nodeId} -.->|param ${String(i)}| ${paramNodeId}`);
      }
    }

    // Process property injections
    if (node.propertyParams.length > 0) {
      for (const [propertyKey, propertyNode] of node.propertyParams) {
        const propertyStr: string = escapeMermaidString(String(propertyKey));
        const propNodeId: string = processServiceNode(propertyNode);
        lines.push(`${nodeId} -.->|prop: ${propertyStr}| ${propNodeId}`);
      }
    }
  }

  /**
   * Processes a ResolvedValueBindingNode (factory/provider pattern).
   */
  function processResolvedValueBindingNode(
    node: Cloneable<ResolvedValueBindingNode>,
    parentNodeId: string,
  ): void {
    const nodeId: string = getOrCreateNodeId(node, 'resolved');
    const bindingType: string = node.binding.type;

    lines.push(
      `${nodeId}["${bindingType}<br/>Binding scope: ${node.binding.scope}"]`,
    );
    lines.push(`${parentNodeId} --> ${nodeId}`);

    // Process parameters
    for (let i: number = 0; i < node.params.length; i++) {
      const param: PlanServiceNode | Cloneable<PlanServiceNode> | undefined =
        node.params[i];
      if (param !== undefined) {
        const paramNodeId: string = processServiceNode(param);
        lines.push(`${nodeId} -.->|param ${String(i)}| ${paramNodeId}`);
      }
    }
  }

  /**
   * Processes a ServiceRedirectionBindingNode (service aliasing).
   */
  function processServiceRedirectionBindingNode(
    node: Cloneable<PlanServiceRedirectionBindingNode>,
    parentNodeId: string,
  ): void {
    const nodeId: string = getOrCreateNodeId(node, 'redirect');
    const targetServiceId: string = escapeMermaidString(
      serviceIdentifierToString(node.binding.targetServiceIdentifier),
    );

    lines.push(`${nodeId}["ServiceRedirection → ${targetServiceId}"]`);
    lines.push(`${parentNodeId} --> ${nodeId}`);

    // Process redirected bindings
    for (const redirection of node.redirections) {
      processBindingNode(redirection, nodeId);
    }
  }

  /**
   * Processes a LeafBindingNode (constant/dynamic values).
   */
  function processLeafBindingNode(
    node: Cloneable<LeafBindingNode>,
    parentNodeId: string,
  ): void {
    const nodeId: string = getOrCreateNodeId(node, 'leaf');
    const bindingType: string = node.binding.type;

    let label: string = bindingType;

    // Add value preview for constant values
    if (bindingType === 'ConstantValue' && 'value' in node.binding) {
      const value: unknown = node.binding.value;
      let valueStr: string;
      if (value === null) {
        valueStr = 'null';
      } else if (value === undefined) {
        valueStr = 'undefined';
      } else if (typeof value === 'object') {
        valueStr = escapeMermaidString('{...}');
      } else if (typeof value === 'string') {
        valueStr = escapeMermaidString(
          value.slice(0, MAX_VALUE_PREVIEW_LENGTH),
        );
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        valueStr = escapeMermaidString(String(value));
      } else if (typeof value === 'symbol') {
        valueStr = escapeMermaidString(value.toString());
      } else {
        // For bigint and other types
        valueStr = typeof value;
      }
      label = `${bindingType}: ${valueStr}`;
    }

    lines.push(
      `${nodeId}["${label}<br/>Binding scope: ${node.binding.scope}"]`,
    );
    lines.push(`${parentNodeId} --> ${nodeId}`);
  }

  // Start processing from the root
  const rootNodeId: string = 'root';
  const serviceIdStr: string = escapeMermaidString(
    serviceIdentifierToString(options.serviceIdentifier),
  );
  const optionalLabel: string = options.optional ? ' (optional)<br/>' : '';
  const multipleLabel: string =
    'isMultiple' in options && options.isMultiple ? ' (multiple)<br/>' : '';
  const nameLabel: string =
    options.name !== undefined ? `Name: "${String(options.name)}"<br/>` : '';

  lines.push(
    `${rootNodeId}["Request:<br/>Service identifier: ${serviceIdStr}<br/>${nameLabel}${optionalLabel}${multipleLabel}"]`,
  );
  lines.push(
    `style ${rootNodeId} fill:#e1f5ff,stroke:#0288d1,stroke-width:3px`,
  );

  // Process the plan tree
  processServiceNode(planResult.tree.root);

  lines.push(
    `${rootNodeId} --> ${getOrCreateNodeId(planResult.tree.root, 'service')}`,
  );

  return lines.join('\n');
}
