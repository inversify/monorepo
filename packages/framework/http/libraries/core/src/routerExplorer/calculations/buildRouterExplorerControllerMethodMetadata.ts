import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  ErrorFilter,
  getClassGuardList,
  getClassInterceptorList,
  getClassMethodGuardList,
  getClassMethodInterceptorList,
  getClassMethodMiddlewareList,
  Guard,
  Interceptor,
  Middleware,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { Newable, ServiceIdentifier } from 'inversify';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap';
import { getControllerMethodHeaderMetadataList } from './getControllerMethodHeaderMetadataList';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

export function buildRouterExplorerControllerMethodMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  controllerMetadata: ControllerMetadata,
  controllerMethodMetadata: ControllerMethodMetadata,
): RouterExplorerControllerMethodMetadata<TRequest, TResponse, TResult> {
  const controllerMethodParameterMetadataList: (
    | ControllerMethodParameterMetadata
    | undefined
  )[] = getControllerMethodParameterMetadataList(
    controllerMetadata.target,
    controllerMethodMetadata.methodKey,
  );

  const controllerMethodStatusCode: HttpStatusCode | undefined =
    getControllerMethodStatusCodeMetadata(
      controllerMetadata.target,
      controllerMethodMetadata.methodKey,
    );

  const controllerMethodGuardList: ServiceIdentifier<Guard<TRequest>>[] = [
    ...getClassGuardList(controllerMetadata.target),
    ...getClassMethodGuardList(
      controllerMetadata.target,
      controllerMethodMetadata.methodKey,
    ),
  ];

  const controllerMethodInterceptorList: ServiceIdentifier<
    Interceptor<TRequest, TResponse>
  >[] = [
    ...getClassInterceptorList(controllerMetadata.target),
    ...getClassMethodInterceptorList(
      controllerMetadata.target,
      controllerMethodMetadata.methodKey,
    ),
  ];

  const controllerMethodMiddlewareList: (
    | // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ServiceIdentifier<Middleware<TRequest, TResponse, any, TResult>>
    | ApplyMiddlewareOptions
  )[] = getClassMethodMiddlewareList(
    controllerMetadata.target,
    controllerMethodMetadata.methodKey,
  );

  const errorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    Newable<ErrorFilter>
  > = buildErrorTypeToErrorFilterMap(
    controllerMetadata.target,
    controllerMethodMetadata.methodKey,
  );

  const middlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(
      controllerMethodMiddlewareList,
    );

  const headerMetadataList: [string, string][] =
    getControllerMethodHeaderMetadataList(
      controllerMetadata.target,
      controllerMethodMetadata.methodKey,
    );

  const useNativeHandler: boolean = getControllerMethodUseNativeHandlerMetadata(
    controllerMetadata.target,
    controllerMethodMetadata.methodKey,
  );

  return {
    errorTypeToErrorFilterMap,
    guardList: controllerMethodGuardList,
    headerMetadataList,
    interceptorList: controllerMethodInterceptorList,
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
