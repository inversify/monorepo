import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1PathsObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { isOpenApiMethod } from '../../../validation/calculations/v3Dot1/isOpenApiMethod.js';
import { BaseOpenApiRouter } from '../BaseOpenApiRouter.js';

export class OpenApi3Dot1Router extends BaseOpenApiRouter<OpenApi3Dot1Object> {
  constructor(openApiObject: OpenApi3Dot1Object) {
    super(
      openApiObject,
      (openApiObject: OpenApi3Dot1Object): Record<string, string[]> => {
        const methodToRoutesObject: Record<string, string[]> = {};

        const pathItemsObject: OpenApi3Dot1PathsObject | undefined =
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
