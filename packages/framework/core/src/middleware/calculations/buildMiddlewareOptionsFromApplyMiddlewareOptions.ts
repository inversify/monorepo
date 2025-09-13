import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { MiddlewareOptions } from '../models/MiddlewareOptions';
import { MiddlewarePhase } from '../models/MiddlewarePhase';
import { isApplyMiddlewareOptions } from '../typeguard/isApplyMiddlewareOptions';

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
