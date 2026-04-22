import { trieInsert } from '../../trie/actions/trieInsert.js';
import { createTrieNode } from '../../trie/calculations/createTrieNode.js';
import { trieIterateEntries } from '../../trie/calculations/trieIterateEntries.js';
import { trieLookup } from '../../trie/calculations/trieLookup.js';
import { type RouterNode } from '../models/RouterNode.js';
import { RouterNodeMatchKind } from '../models/RouterNodeMatchKind.js';
import { sortOpenApiPathTemplates } from './sortOpenApiPathTemplates.js';

function extractConstraints(
  pathSegments: (string | RegExp)[],
): [number, RegExp][] {
  return pathSegments
    .map(
      (segment: string | RegExp, index: number): [number, string | RegExp] => [
        index,
        segment,
      ],
    )
    .filter(
      (
        indexAndPathSegment: [number, string | RegExp],
      ): indexAndPathSegment is [number, RegExp] =>
        indexAndPathSegment[1] instanceof RegExp,
    );
}

function maybeSetAuxiliaryNodeMatch(
  node: RouterNode,
  path: string,
  pathSegmentsOrConstraints: (string | RegExp)[],
): void {
  const constraints: [number, RegExp][] = extractConstraints(
    pathSegmentsOrConstraints,
  );

  if (node.match === undefined) {
    if (constraints.length === 0) {
      node.match = {
        kind: RouterNodeMatchKind.literal,
        route: path,
      };
    } else {
      node.match = {
        kind: RouterNodeMatchKind.param,
        routes: [
          {
            constraints,
            route: path,
          },
        ],
      };
    }
  } else {
    if (
      node.match.kind === RouterNodeMatchKind.param &&
      constraints.length > 0
    ) {
      node.match.routes.push({
        constraints,
        route: path,
      });
    }
  }
}

function populateAuxiliaryNode(
  node: RouterNode,
  path: string,
  pathSegmentsOrConstraints: (string | RegExp)[],
  index: number,
): void {
  const segment: string | RegExp | undefined = pathSegmentsOrConstraints[index];

  if (segment === undefined) {
    maybeSetAuxiliaryNodeMatch(node, path, pathSegmentsOrConstraints);
    return;
  }

  if (typeof segment === 'string') {
    let childNode: RouterNode | undefined = trieLookup(
      node.nextLiterals,
      segment,
      0,
      segment.length,
    );

    if (childNode === undefined) {
      childNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      trieInsert(node.nextLiterals, segment, childNode);
    }

    populateAuxiliaryNode(
      childNode,
      path,
      pathSegmentsOrConstraints,
      index + 1,
    );

    return;
  }

  // Segment is a RegExp, so we need to populate the nextParam node

  if (node.nextParam === undefined) {
    node.nextParam = {
      match: undefined,
      nextLiterals: createTrieNode(),
      nextParam: undefined,
    };
  }

  populateAuxiliaryNode(
    node.nextParam,
    path,
    pathSegmentsOrConstraints,
    index + 1,
  );
}

function populateRouterNode(
  routerAndAuxiliaryNodePairList: [RouterNode, RouterNode][],
  pathSegmentsOrConstraints: (string | RegExp)[],
  index: number,
): void {
  const segment: string | RegExp | undefined = pathSegmentsOrConstraints[index];

  if (segment === undefined) {
    // We reach the end of the path segments, so we can populate the router nodes
    for (const [routerNode, auxiliaryNode] of routerAndAuxiliaryNodePairList) {
      if (routerNode.match === undefined) {
        routerNode.match = auxiliaryNode.match;
      }
    }

    return;
  }

  // We need to expand the router nodes with the current segment and then continue with the next segment

  const nextRouterAndAuxiliaryNodePairList: [RouterNode, RouterNode][] = [];

  for (const [routerNode, auxiliaryNode] of routerAndAuxiliaryNodePairList) {
    if (typeof segment === 'string') {
      const nextAuxiliaryNode: RouterNode | undefined = trieLookup(
        auxiliaryNode.nextLiterals,
        segment,
        0,
        segment.length,
      );

      if (nextAuxiliaryNode !== undefined) {
        let nextRouterNode: RouterNode | undefined = trieLookup(
          routerNode.nextLiterals,
          segment,
          0,
          segment.length,
        );

        if (nextRouterNode === undefined) {
          nextRouterNode = {
            match: undefined,
            nextLiterals: createTrieNode(),
            nextParam: undefined,
          };

          trieInsert(routerNode.nextLiterals, segment, nextRouterNode);
        }

        nextRouterAndAuxiliaryNodePairList.push([
          nextRouterNode,
          nextAuxiliaryNode,
        ]);
      }
    } else {
      // First, let's create the nextParam node if it does not exists in the auxiliary node

      if (auxiliaryNode.nextParam !== undefined) {
        if (routerNode.nextParam === undefined) {
          routerNode.nextParam = {
            match: undefined,
            nextLiterals: createTrieNode(),
            nextParam: undefined,
          };
        }

        nextRouterAndAuxiliaryNodePairList.push([
          routerNode.nextParam,
          auxiliaryNode.nextParam,
        ]);

        /*
         * Now, we need to populate literal nodes for all the next literals of the
         * auxiliary node that matches the current segment pattern
         */

        for (const [nextAuxiliaryLiteral] of trieIterateEntries(
          auxiliaryNode.nextLiterals,
        )) {
          if (segment.test(nextAuxiliaryLiteral)) {
            let nextRouterNode: RouterNode | undefined = trieLookup(
              routerNode.nextLiterals,
              nextAuxiliaryLiteral,
              0,
              nextAuxiliaryLiteral.length,
            );

            if (nextRouterNode === undefined) {
              nextRouterNode = {
                match: undefined,
                nextLiterals: createTrieNode(),
                nextParam: undefined,
              };

              trieInsert(
                routerNode.nextLiterals,
                nextAuxiliaryLiteral,
                nextRouterNode,
              );
            }

            nextRouterAndAuxiliaryNodePairList.push([
              nextRouterNode,
              auxiliaryNode.nextParam,
            ]);
          }
        }
      }
    }
  }

  populateRouterNode(
    nextRouterAndAuxiliaryNodePairList,
    pathSegmentsOrConstraints,
    index + 1,
  );
}

const PARAM_SEGMENT_REGEXP: RegExp = /\{[^{}]+\}/;

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pathSegmentToSegmentOrConstraint(segment: string): string | RegExp {
  if (!segment.includes('{')) {
    return segment;
  }

  const pattern: string = segment
    .split(PARAM_SEGMENT_REGEXP)
    .map(escapeRegExp)
    .join('.+');

  return new RegExp(`^${pattern}$`);
}

export function buildRouterNode(paths: string[]): RouterNode {
  const pathAndSegmentsOrConstraints: [string, (string | RegExp)[]][] =
    paths.map((path: string) => [
      path,
      (path === '/' ? [''] : path.split('/')).map(
        pathSegmentToSegmentOrConstraint,
      ),
    ]);

  pathAndSegmentsOrConstraints.sort(
    (
      [firstPath]: [string, (string | RegExp)[]],
      [secondPath]: [string, (string | RegExp)[]],
    ) => sortOpenApiPathTemplates(firstPath, secondPath),
  );

  // Useful data structure to efficiently build the router tree, but not ideal for runtime usage
  const auxiliaryNode: RouterNode = {
    match: undefined,
    nextLiterals: createTrieNode(),
    nextParam: undefined,
  };

  // Populate the auxiliary node with all paths
  for (const [path, pathSegmentOrConstraint] of pathAndSegmentsOrConstraints) {
    populateAuxiliaryNode(auxiliaryNode, path, pathSegmentOrConstraint, 0);
  }

  // Create the final router node with the assistance of the auxiliary node
  const routerNode: RouterNode = {
    match: undefined,
    nextLiterals: createTrieNode(),
    nextParam: undefined,
  };

  for (const [, pathSegmentsOrConstraints] of pathAndSegmentsOrConstraints) {
    populateRouterNode(
      [[routerNode, auxiliaryNode]],
      pathSegmentsOrConstraints,
      0,
    );
  }

  return routerNode;
}
