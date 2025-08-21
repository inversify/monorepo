import { MiddlewarePhase } from '@inversifyjs/framework-core';

import { ApplyMiddlewareOptions } from '../../http/models/ApplyMiddlewareOptions';
import { isApplyMiddlewareOptions } from '../../http/typeguard/isApplyMiddlewareOptions';
import { MiddlewareOptions } from '../model/MiddlewareOptions';

export function buildMiddlewareOptionsFromApplyMiddlewareOptions(
  applyMiddlewareOptionsList: (NewableFunction | ApplyMiddlewareOptions)[],
): MiddlewareOptions {
  const middlewareOptions: MiddlewareOptions = {
    postHandlerMiddlewareList: [],
    preHandlerMiddlewareList: [],
  };

  for (const applyMiddlewareOptions of applyMiddlewareOptionsList) {
    if (isApplyMiddlewareOptions(applyMiddlewareOptions)) {
      const middlewareList: NewableFunction[] = [];

      if (Array.isArray(applyMiddlewareOptions.middleware)) {
        middlewareList.push(...applyMiddlewareOptions.middleware);
      } else {
        middlewareList.push(applyMiddlewareOptions.middleware);
      }

      if (applyMiddlewareOptions.phase === MiddlewarePhase.PostHandler) {
        middlewareOptions.postHandlerMiddlewareList.push(...middlewareList);
      } else {
        middlewareOptions.preHandlerMiddlewareList.push(...middlewareList);
      }
    } else {
      middlewareOptions.preHandlerMiddlewareList.push(applyMiddlewareOptions);
    }
  }

  return middlewareOptions;
}
