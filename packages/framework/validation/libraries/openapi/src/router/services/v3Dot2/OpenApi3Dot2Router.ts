import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2PathsObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { isOpenApiMethod } from '../../../validation/calculations/v3Dot2/isOpenApiMethod.js';
import { BaseOpenApiRouter } from '../BaseOpenApiRouter.js';

export class OpenApi3Dot2Router extends BaseOpenApiRouter<OpenApi3Dot2Object> {
  constructor(openApiObject: OpenApi3Dot2Object) {
    super(
      openApiObject,
      (openApiObject: OpenApi3Dot2Object): Record<string, string[]> => {
        const methodToRoutesObject: Record<string, string[]> = {};

        const pathItemsObject: OpenApi3Dot2PathsObject | undefined =
          openApiObject.paths;

        if (pathItemsObject !== undefined) {
          for (const [path, pathItemObject] of Object.entries(
            pathItemsObject,
          )) {
            for (const method of Object.keys(pathItemObject)) {
              if (isOpenApiMethod(method)) {
                if (methodToRoutesObject[method] === undefined) {
                  methodToRoutesObject[method] = [];
                }

                methodToRoutesObject[method].push(path);
              }
            }
          }
        }

        return methodToRoutesObject;
      },
    );
  }
}
