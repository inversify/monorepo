import { type ServiceIdentifier } from 'inversify';

import { type ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../models/Middleware.js';
import { type MiddlewareOptions } from '../models/MiddlewareOptions.js';
import { MiddlewarePhase } from '../models/MiddlewarePhase.js';
import { isApplyMiddlewareOptions } from '../typeguard/isApplyMiddlewareOptions.js';

export function buildMiddlewareOptionsFromApplyMiddlewareOptions(
  applyMiddlewareOptionsList: (
    | ServiceIdentifier<Middleware>
    | ApplyMiddlewareOptions
  )[],
): MiddlewareOptions {
  const middlewareOptions: MiddlewareOptions = {
    postHandlerMiddlewareList: [],
    preHandlerMiddlewareList: [],
  };

  for (const applyMiddlewareOptions of applyMiddlewareOptionsList) {
    if (isApplyMiddlewareOptions(applyMiddlewareOptions)) {
      const middlewareList: ServiceIdentifier<Middleware>[] =
        applyMiddlewareOptions.phase === MiddlewarePhase.PostHandler
          ? middlewareOptions.postHandlerMiddlewareList
          : middlewareOptions.preHandlerMiddlewareList;

      if (Array.isArray(applyMiddlewareOptions.middleware)) {
        middlewareList.push(...applyMiddlewareOptions.middleware);
      } else {
        middlewareList.push(applyMiddlewareOptions.middleware);
      }
    } else {
      middlewareOptions.preHandlerMiddlewareList.push(applyMiddlewareOptions);
    }
  }

  return middlewareOptions;
}
