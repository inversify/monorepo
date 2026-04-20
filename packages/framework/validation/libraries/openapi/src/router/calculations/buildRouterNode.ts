import { type RouterNode } from '../models/RouterNode.js';
import { wildcardKey } from '../models/wildcardKey.js';
import { isPathParam } from './isPathParam.js';

function populateAuxiliaryNode(
  node: RouterNode,
  path: string,
  pathSegments: (string | symbol)[],
  index: number,
): void {
  const segment: string | symbol | undefined = pathSegments[index];

  if (segment === undefined) {
    if (node.path === undefined) {
      node.path = path;
    }

    return;
  }

  if (node.children === undefined) {
    node.children = {};
  }

  if (node.children[segment] === undefined) {
    node.children[segment] = {
      children: undefined,
      path: undefined,
    };
  }

  populateAuxiliaryNode(node.children[segment], path, pathSegments, index + 1);
}

function populateRouterNode(
  routerAndAuxiliaryNodePairList: [RouterNode, RouterNode][],
  path: string,
  pathSegments: (string | symbol)[],
  index: number,
): void {
  const segment: string | symbol | undefined = pathSegments[index];

  if (segment === undefined) {
    // We reach the end of the path segments, so we can populate the router nodes
    for (const [node] of routerAndAuxiliaryNodePairList) {
      if (node.path === undefined) {
        node.path = path;
      }
    }

    return;
  }

  // We need to expand the router nodes with the current segment and then continue with the next segment

  const nextRouterAndAuxiliaryNodePairList: [RouterNode, RouterNode][] = [];

  for (const [routerNode, auxiliaryNode] of routerAndAuxiliaryNodePairList) {
    let nextSegmentProperties: (string | symbol)[];

    if (segment === wildcardKey) {
      nextSegmentProperties =
        auxiliaryNode.children === undefined
          ? []
          : Reflect.ownKeys(auxiliaryNode.children).filter(
              (key: string | symbol) => key !== wildcardKey,
            );
      nextSegmentProperties.push(wildcardKey);
    } else {
      nextSegmentProperties = [segment];
    }

    for (const nextSegmentProperty of nextSegmentProperties) {
      const nextAuxiliaryNode: RouterNode | undefined =
        auxiliaryNode.children?.[nextSegmentProperty];

      if (nextAuxiliaryNode !== undefined) {
        if (routerNode.children === undefined) {
          routerNode.children = {};
        }

        if (routerNode.children[nextSegmentProperty] === undefined) {
          routerNode.children[nextSegmentProperty] = {
            children: undefined,
            path: undefined,
          };
        }

        nextRouterAndAuxiliaryNodePairList.push([
          routerNode.children[nextSegmentProperty],
          nextAuxiliaryNode,
        ]);
      }
    }
  }

  populateRouterNode(
    nextRouterAndAuxiliaryNodePairList,
    path,
    pathSegments,
    index + 1,
  );
}

/**
 * Sorts path segments to keep path priority as stated in OpenAPI 3.X specifications.
 * @param firstSegments First segments
 * @param secondSegments Second segments
 * @returns Numeric value indicating the order of the segments for sorting purposes.
 */
function sortPathSegments(
  firstSegments: (string | symbol)[],
  secondSegments: (string | symbol)[],
): number {
  const minLength: number = Math.min(
    firstSegments.length,
    secondSegments.length,
  );

  for (let index: number = 0; index < minLength; ++index) {
    const firstSegment: string | symbol = firstSegments[index] as
      | string
      | symbol;
    const secondSegment: string | symbol = secondSegments[index] as
      | string
      | symbol;

    if (typeof firstSegment === 'string') {
      if (typeof secondSegment === 'string') {
        if (firstSegment < secondSegment) {
          return -1;
        } else if (firstSegment > secondSegment) {
          return 1;
        }
      } else {
        return -1;
      }
    } else {
      if (typeof secondSegment === 'string') {
        return 1;
      }
    }
  }

  return firstSegments.length - secondSegments.length;
}

export function buildRouterNode(paths: string[]): RouterNode {
  const pathAndSegmentsList: [string, (string | symbol)[]][] = paths.map(
    (path: string) => [
      path,
      path
        .split('/')
        .map((segment: string) =>
          isPathParam(segment) ? wildcardKey : segment,
        ),
    ],
  );

  pathAndSegmentsList.sort(
    (
      [, firstSegments]: [string, (string | symbol)[]],
      [, secondSegments]: [string, (string | symbol)[]],
    ) => sortPathSegments(firstSegments, secondSegments),
  );

  // Useful data structure to efficiently build the router tree, but not ideal for runtime usage
  const auxiliaryNode: RouterNode = {
    children: undefined,
    path: undefined,
  };

  // Populate the auxiliary node with all paths
  for (const [path, pathSegments] of pathAndSegmentsList) {
    populateAuxiliaryNode(auxiliaryNode, path, pathSegments, 0);
  }

  // Create the final router node with the assistance of the auxiliary node
  const routerNode: RouterNode = {
    children: undefined,
    path: undefined,
  };

  for (const [path, pathSegments] of pathAndSegmentsList) {
    populateRouterNode([[routerNode, auxiliaryNode]], path, pathSegments, 0);
  }

  return routerNode;
}
