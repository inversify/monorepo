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

export function resolveControllerMethodParamNameList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): string[] {
  const controllerMetadataList: ControllerMetadata[] =
    getControllerMetadataList() ?? [];

  const paramNameList: string[] = [];

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

      const routePath: string = buildNormalizedPath(
        `${controllerMetadata.path}${controllerMethodMetadata.path}`,
      );

      for (const paramName of getPathParamNameList(routePath)) {
        if (!paramNameList.includes(paramName)) {
          paramNameList.push(paramName);
        }
      }
    }
  }

  if (!isPathMetadataFound) {
    throw new Error(
      `Unable to resolve route parameter names for "${controllerConstructor.name}.${String(methodKey)}". No controller path metadata nor HTTP method path metadata was found for this method. Decorate the method with an HTTP method decorator (@Get, @Post, ...) and its class with @Controller.`,
    );
  }

  return paramNameList;
}
