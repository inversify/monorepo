import { ServiceIdentifier } from 'inversify';

import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { Middleware } from '../models/Middleware';
import { MiddlewareOptions } from '../models/MiddlewareOptions';
import { MiddlewarePhase } from '../models/MiddlewarePhase';
import { isApplyMiddlewareOptions } from '../typeguard/isApplyMiddlewareOptions';

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
