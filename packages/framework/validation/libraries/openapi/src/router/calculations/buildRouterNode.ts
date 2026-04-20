import { type RouterNode } from '../models/RouterNode.js';
import { wildcardKey } from '../models/wildcardKey.js';
import { isPathParam } from './isPathParam.js';

function populateAuxiliaryNode(
  node: RouterNode,
  path: string,
  pathSegments: string[],
  index: number,
): void {
  const segment: string | undefined = pathSegments[index];

  if (segment === undefined) {
    if (node.path === undefined) {
      node.path = path;
    }

    return;
  }

  if (node.children === undefined) {
    node.children = {};
  }

  const nextSegmentProperty: string | symbol = isPathParam(segment)
    ? wildcardKey
    : segment;

  if (node.children[nextSegmentProperty] === undefined) {
    node.children[nextSegmentProperty] = {
      children: undefined,
      path: undefined,
    };
  }

  populateAuxiliaryNode(
    node.children[nextSegmentProperty],
    path,
    pathSegments,
    index + 1,
  );
}

function populateRouterNode(
  routerAndAuxiliaryNodePairList: [RouterNode, RouterNode][],
  path: string,
  pathSegments: string[],
  index: number,
): void {
  const segment: string | undefined = pathSegments[index];

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

    if (isPathParam(segment)) {
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

export function buildRouterNode(paths: string[]): RouterNode {
  const pathAndSegmentsList: [string, string[]][] = paths.map(
    (path: string) => [path, path.split('/')],
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
