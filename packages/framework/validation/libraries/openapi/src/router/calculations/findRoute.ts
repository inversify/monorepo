import { trieLookup } from '../../trie/calculations/trieLookup.js';
import { type RouterNode } from '../models/RouterNode.js';
import { RouterNodeMatchKind } from '../models/RouterNodeMatchKind.js';
import { type RouterNodeParamMatchRoute } from '../models/RouterNodeParamMatch.js';

export function findRoute(node: RouterNode, path: string): string | undefined {
  const segmentBounds: [number, number][] = [];

  let currentNode: RouterNode | undefined = node;
  let segmentStart: number = 0;

  while (segmentStart < path.length) {
    let segmentEnd: number = path.indexOf('/', segmentStart);

    if (segmentEnd === -1) {
      segmentEnd = path.length;
    }

    segmentBounds.push([segmentStart, segmentEnd]);

    /*
     * We could probably optimize this further with a compressed trie, but the
     * current character-level trie already provides O(segment_length) lookup
     * with zero intermediate allocations.
     */
    const nextLiteral: RouterNode | undefined = trieLookup(
      currentNode.nextLiterals,
      path,
      segmentStart,
      segmentEnd,
    );

    currentNode = nextLiteral ?? currentNode.nextParam;

    if (currentNode === undefined) {
      return undefined;
    }

    segmentStart = segmentEnd + 1;
  }

  if (currentNode.match === undefined) {
    return undefined;
  }

  if (currentNode.match.kind === RouterNodeMatchKind.literal) {
    return currentNode.match.route;
  }

  return currentNode.match.routes.find(
    ({ constraints }: RouterNodeParamMatchRoute): boolean =>
      constraints.every(([index, constraint]: [number, RegExp]): boolean => {
        const [start, end]: [number, number] = segmentBounds[index] as [
          number,
          number,
        ];

        return constraint.test(path.slice(start, end));
      }),
  )?.route;
}
