import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  getClassMethodGuardList,
  getClassMethodMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

import { HttpStatusCode } from '../../http/responses/HttpStatusCode';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { getControllerMethodHeaderMetadataList } from './getControllerMethodHeaderMetadataList';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

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
  )[] = getControllerMethodParameterMetadataList(
    controller,
    controllerMethodMetadata.methodKey,
  );

  const controllerMethodStatusCode: HttpStatusCode | undefined =
    getControllerMethodStatusCodeMetadata(
      controller,
      controllerMethodMetadata.methodKey,
    );

  const controllerMethodGuardList: NewableFunction[] = getClassMethodGuardList(
    controller,
    controllerMethodMetadata.methodKey,
  );

  const controllerMethodMiddlewareList: (
    | NewableFunction
    | ApplyMiddlewareOptions
  )[] = getClassMethodMiddlewareList(
    controller,
    controllerMethodMetadata.methodKey,
  );

  const middlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(
      controllerMethodMiddlewareList,
    );

  const headerMetadataList: [string, string][] =
    getControllerMethodHeaderMetadataList(
      controller,
      controllerMethodMetadata.methodKey,
    );

  const useNativeHandler: boolean = getControllerMethodUseNativeHandlerMetadata(
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
