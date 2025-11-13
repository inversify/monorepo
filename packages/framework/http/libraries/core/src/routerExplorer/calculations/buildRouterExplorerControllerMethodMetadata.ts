import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  ErrorFilter,
  getClassGuardList,
  getClassInterceptorList,
  getClassMethodGuardList,
  getClassMethodInterceptorList,
  getClassMethodMiddlewareList,
  getClassMiddlewareList,
  Guard,
  Interceptor,
  Middleware,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { Logger } from '@inversifyjs/logger';
import { Newable, ServiceIdentifier } from 'inversify';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap';
import { getControllerMethodHeaderMetadata } from './getControllerMethodHeaderMetadata';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

export function buildRouterExplorerControllerMethodMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  logger: Logger,
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

  const controllerMiddlewareList: (
    | // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ServiceIdentifier<Middleware<TRequest, TResponse, any, TResult>>
    | ApplyMiddlewareOptions
  )[] = getClassMiddlewareList(controllerMetadata.target);

  const controllerMiddlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(controllerMiddlewareList);

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
    logger,
    controllerMetadata.target,
    controllerMethodMetadata.methodKey,
  );

  const controllerMethodMiddlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(
      controllerMethodMiddlewareList,
    );

  const headerMetadataList: Record<string, string> =
    getControllerMethodHeaderMetadata(
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
    postHandlerMiddlewareList: [
      ...controllerMiddlewareOptions.postHandlerMiddlewareList,
      ...controllerMethodMiddlewareOptions.postHandlerMiddlewareList,
    ],
    preHandlerMiddlewareList: [
      ...controllerMiddlewareOptions.preHandlerMiddlewareList,
      ...controllerMethodMiddlewareOptions.preHandlerMiddlewareList,
    ],
    requestMethodType: controllerMethodMetadata.requestMethodType,
    statusCode: controllerMethodStatusCode,
    useNativeHandler,
  };
}
