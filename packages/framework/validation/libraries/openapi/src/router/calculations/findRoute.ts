import { type RouterNode } from '../models/RouterNode.js';
import { wildcardKey } from '../models/wildcardKey.js';

export function findRoute(node: RouterNode, path: string): string | undefined {
  const segments: string[] = path.split('/');

  let currentNode: RouterNode | undefined = node;

  for (const segment of segments) {
    if (currentNode.children === undefined) {
      return undefined;
    }

    currentNode =
      currentNode.children[segment] ?? currentNode.children[wildcardKey];

    if (currentNode === undefined) {
      return undefined;
    }
  }

  return currentNode.path;
}
