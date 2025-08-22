import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  exploreClassMethodGuardList,
  exploreClassMethodMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

import { HttpStatusCode } from '../../http/responses/HttpStatusCode';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { exploreControllerMethodHeaderMetadataList } from './exploreControllerMethodHeaderMetadataList';
import { exploreControllerMethodParameterMetadataList } from './exploreControllerMethodParameterMetadataList';
import { exploreControllerMethodStatusCodeMetadata } from './exploreControllerMethodStatusCodeMetadata';
import { exploreControllerMethodUseNativeHandlerMetadata } from './exploreControllerMethodUseNativeHandlerMetadata';

export function buildRouterExplorerControllerMethodMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  controller: NewableFunction,
  controllerMethodMetadata: ControllerMethodMetadata,
): RouterExplorerControllerMethodMetadata<TRequest, TResponse, TResult> {
  const controllerMethodParameterMetadataList: (
    | ControllerMethodParameterMetadata
    | undefined
  )[] = exploreControllerMethodParameterMetadataList(
    controller,
    controllerMethodMetadata.methodKey,
  );

  const controllerMethodStatusCode: HttpStatusCode | undefined =
    exploreControllerMethodStatusCodeMetadata(
      controller,
      controllerMethodMetadata.methodKey,
    );

  const controllerMethodGuardList: NewableFunction[] =
    exploreClassMethodGuardList(controller, controllerMethodMetadata.methodKey);

  const controllerMethodMiddlewareList: (
    | NewableFunction
    | ApplyMiddlewareOptions
  )[] = exploreClassMethodMiddlewareList(
    controller,
    controllerMethodMetadata.methodKey,
  );

  const middlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(
      controllerMethodMiddlewareList,
    );

  const headerMetadataList: [string, string][] =
    exploreControllerMethodHeaderMetadataList(
      controller,
      controllerMethodMetadata.methodKey,
    );

  const useNativeHandler: boolean =
    exploreControllerMethodUseNativeHandlerMetadata(
      controller,
      controllerMethodMetadata.methodKey,
    );

  return {
    guardList: controllerMethodGuardList,
    headerMetadataList,
    methodKey: controllerMethodMetadata.methodKey,
    parameterMetadataList: controllerMethodParameterMetadataList,
    path: controllerMethodMetadata.path,
    postHandlerMiddlewareList: middlewareOptions.postHandlerMiddlewareList,
    preHandlerMiddlewareList: middlewareOptions.preHandlerMiddlewareList,
    requestMethodType: controllerMethodMetadata.requestMethodType,
    statusCode: controllerMethodStatusCode,
    useNativeHandler,
  };
}
