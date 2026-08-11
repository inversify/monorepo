import {
  buildNormalizedPath,
  type ControllerMetadata,
  type ControllerMethodMetadata,
  getControllerMetadataList,
  getControllerMethodMetadataList,
} from '@inversifyjs/http-core';

import { getPathParamNameList } from './getPathParamNameList.js';

function isControllerMetadataRelated(
  controllerMetadata: ControllerMetadata,
  controllerConstructor: NewableFunction,
): boolean {
  return (
    controllerMetadata.target === controllerConstructor ||
    Object.prototype.isPrototypeOf.call(
      controllerConstructor,
      controllerMetadata.target,
    )
  );
}

function assertControllerMethodPathMetadataFound(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
  isPathMetadataFound: boolean,
): void {
  if (!isPathMetadataFound) {
    throw new Error(
      `Unable to resolve route parameter names for "${controllerConstructor.name}.${String(methodKey)}". No controller path metadata nor HTTP method path metadata was found for this method. Decorate the method with an HTTP method decorator (@Get, @Post, ...) and its class with @Controller.`,
    );
  }
}

function areParamNameListsEqual(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every(
      (paramName: string, index: number): boolean => paramName === right[index],
    )
  );
}

export function resolveControllerMethodParamNameList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
  matchedRoutePath?: string,
): string[] {
  const controllerMetadataList: ControllerMetadata[] =
    getControllerMetadataList() ?? [];

  const matchedRouteParamNameList: string[][] = [];

  let isPathMetadataFound: boolean = false;

  for (const controllerMetadata of controllerMetadataList) {
    if (
      !isControllerMetadataRelated(controllerMetadata, controllerConstructor)
    ) {
      continue;
    }

    const controllerMethodMetadataList: ControllerMethodMetadata[] =
      getControllerMethodMetadataList(controllerMetadata.target);

    for (const controllerMethodMetadata of controllerMethodMetadataList) {
      if (controllerMethodMetadata.methodKey !== methodKey) {
        continue;
      }

      isPathMetadataFound = true;

      if (matchedRoutePath !== undefined) {
        continue;
      }

      const routePath: string = buildNormalizedPath(
        `${controllerMetadata.path}${controllerMethodMetadata.path}`,
      );

      matchedRouteParamNameList.push(getPathParamNameList(routePath));
    }
  }

  assertControllerMethodPathMetadataFound(
    controllerConstructor,
    methodKey,
    isPathMetadataFound,
  );

  if (matchedRoutePath !== undefined) {
    return getPathParamNameList(matchedRoutePath);
  }

  if (matchedRouteParamNameList.length === 0) {
    return [];
  }

  const firstParamNameList: string[] = matchedRouteParamNameList[0] as string[];
  const remainingParamNameList: string[][] = matchedRouteParamNameList.slice(1);

  for (const paramNameList of remainingParamNameList) {
    if (!areParamNameListsEqual(firstParamNameList, paramNameList)) {
      throw new Error(
        `Unable to resolve route parameter names for "${controllerConstructor.name}.${String(methodKey)}". The method is mapped to multiple paths with different route parameters, so numeric getParameter() indexes cannot be resolved without the matched route path.`,
      );
    }
  }

  return firstParamNameList;
}
