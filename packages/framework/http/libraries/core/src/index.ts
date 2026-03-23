import {
  ApplyMiddleware,
  CatchError,
  type CatchErrorOptions,
  type ErrorFilter,
  type Guard,
  type Interceptor,
  type InterceptorTransformObject,
  type Middleware,
  MiddlewarePhase,
  type Pipe,
  type PipeMetadata,
  UseErrorFilter,
  UseGuard,
  UseInterceptor,
} from '@inversifyjs/framework-core';

import { InversifyHttpAdapter } from './http/adapter/InversifyHttpAdapter.js';
import { buildNormalizedPath } from './http/calculations/buildNormalizedPath.js';
import { createCustomNativeParameterDecorator } from './http/calculations/createCustomNativeParameterDecorator.js';
import { createCustomParameterDecorator } from './http/calculations/createCustomParameterDecorator.js';
import { All } from './http/decorators/All.js';
import { Body } from './http/decorators/Body.js';
import { Controller } from './http/decorators/Controller.js';
import { Cookies } from './http/decorators/Cookies.js';
import { Delete } from './http/decorators/Delete.js';
import { Get } from './http/decorators/Get.js';
import { Head } from './http/decorators/Head.js';
import { Headers } from './http/decorators/Headers.js';
import { Next } from './http/decorators/Next.js';
import { Options } from './http/decorators/Options.js';
import { Params } from './http/decorators/Params.js';
import { Patch } from './http/decorators/Patch.js';
import { Post } from './http/decorators/Post.js';
import { Put } from './http/decorators/Put.js';
import { Query } from './http/decorators/Query.js';
import { Request } from './http/decorators/Request.js';
import { Response } from './http/decorators/Response.js';
import { routeValueMetadata } from './http/decorators/routeValueMetadata.js';
import { SetHeader } from './http/decorators/SetHeader.js';
import { StatusCode } from './http/decorators/StatusCode.js';
import { type ControllerOptions } from './http/models/ControllerOptions.js';
import { type ControllerResponse } from './http/models/ControllerResponse.js';
import { type CustomNativeParameterDecoratorHandler } from './http/models/CustomNativeParameterDecoratorHandler.js';
import { type CustomNativeParameterDecoratorHandlerOptions } from './http/models/CustomNativeParameterDecoratorHandlerOptions.js';
import { type CustomParameterDecoratorHandler } from './http/models/CustomParameterDecoratorHandler.js';
import { type CustomParameterDecoratorHandlerOptions } from './http/models/CustomParameterDecoratorHandlerOptions.js';
import { type HttpAdapterOptions } from './http/models/HttpAdapterOptions.js';
import { httpApplicationServiceIdentifier } from './http/models/httpApplicationServiceIdentifier.js';
import { HttpStatusCode } from './http/models/HttpStatusCode.js';
import { type MiddlewareHandler } from './http/models/MiddlewareHandler.js';
import { type RequestHandler } from './http/models/RequestHandler.js';
import { RequestMethodParameterType } from './http/models/RequestMethodParameterType.js';
import { RequestMethodType } from './http/models/RequestMethodType.js';
import { type RequiredOptions } from './http/models/RequiredOptions.js';
import { type RouteParamOptions } from './http/models/RouteParamOptions.js';
import { type RouteParams } from './http/models/RouteParams.js';
import { type RouterParams } from './http/models/RouterParams.js';
import { routeValueMetadataSymbol } from './http/models/routeValueMetadataSymbol.js';
import { isHttpResponse } from './httpResponse/calculations/isHttpResponse.js';
import { AcceptedHttpResponse } from './httpResponse/models/AcceptedHttpResponse.js';
import { AlreadyReportedHttpResponse } from './httpResponse/models/AlreadyReportedHttpResponse.js';
import { BadGatewayHttpResponse } from './httpResponse/models/BadGatewayHttpResponse.js';
import { BadRequestHttpResponse } from './httpResponse/models/BadRequestHttpResponse.js';
import { ConflictHttpResponse } from './httpResponse/models/ConflictHttpResponse.js';
import { ContentDifferentHttpResponse } from './httpResponse/models/ContentDifferentHttpResponse.js';
import { CreatedHttpResponse } from './httpResponse/models/CreatedHttpResponse.js';
import { ErrorHttpResponse } from './httpResponse/models/ErrorHttpResponse.js';
import { ForbiddenHttpResponse } from './httpResponse/models/ForbiddenHttpResponse.js';
import { GatewayTimeoutHttpResponse } from './httpResponse/models/GatewayTimeoutHttpResponse.js';
import { GoneHttpResponse } from './httpResponse/models/GoneHttpResponse.js';
import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from './httpResponse/models/HttpResponse.js';
import { HttpVersionNotSupportedHttpResponse } from './httpResponse/models/HttpVersionNotSupportedHttpResponse.js';
import { InsufficientStorageHttpResponse } from './httpResponse/models/InsufficientStorageHttpResponse.js';
import { InternalServerErrorHttpResponse } from './httpResponse/models/InternalServerErrorHttpResponse.js';
import { LoopDetectedHttpResponse } from './httpResponse/models/LoopDetectedHttpResponse.js';
import { MethodNotAllowedHttpResponse } from './httpResponse/models/MethodNotAllowedHttpResponse.js';
import { MultiStatusHttpResponse } from './httpResponse/models/MultiStatusHttpResponse.js';
import { NoContentHttpResponse } from './httpResponse/models/NoContentHttpResponse.js';
import { NonAuthoritativeInformationHttpResponse } from './httpResponse/models/NonAuthoritativeInformationHttpResponse.js';
import { NotAcceptableHttpResponse } from './httpResponse/models/NotAcceptableHttpResponse.js';
import { NotFoundHttpResponse } from './httpResponse/models/NotFoundHttpResponse.js';
import { NotImplementedHttpResponse } from './httpResponse/models/NotImplementedHttpResponse.js';
import { OkHttpResponse } from './httpResponse/models/OkHttpResponse.js';
import { PartialContentHttpResponse } from './httpResponse/models/PartialContentHttpResponse.js';
import { PaymentRequiredHttpResponse } from './httpResponse/models/PaymentRequiredHttpResponse.js';
import { ResetContentHttpResponse } from './httpResponse/models/ResetContentHttpResponse.js';
import { ServiceUnavailableHttpResponse } from './httpResponse/models/ServiceUnavailableHttpResponse.js';
import { SuccessHttpResponse } from './httpResponse/models/SuccessHttpResponse.js';
import { UnauthorizedHttpResponse } from './httpResponse/models/UnauthorizedHttpResponse.js';
import { UnprocessableEntityHttpResponse } from './httpResponse/models/UnprocessableEntityHttpResponse.js';
import { handleMiddlewareList } from './middleware/actions/handleMiddlewareList.js';
import { getControllerMetadataList } from './routerExplorer/calculations/getControllerMetadataList.js';
import { getControllerMethodMetadataList } from './routerExplorer/calculations/getControllerMethodMetadataList.js';
import { type ControllerMetadata } from './routerExplorer/model/ControllerMetadata.js';
import { type ControllerMethodMetadata } from './routerExplorer/model/ControllerMethodMetadata.js';
import { createRouteValueMetadataUtils } from './valueMetadata/calculations/createRouteValueMetadataUtils.js';

export type {
  CatchErrorOptions,
  ControllerMetadata,
  ControllerMethodMetadata,
  ControllerOptions,
  ControllerResponse,
  CustomNativeParameterDecoratorHandler,
  CustomNativeParameterDecoratorHandlerOptions,
  CustomParameterDecoratorHandler,
  CustomParameterDecoratorHandlerOptions,
  ErrorFilter,
  Guard,
  HttpAdapterOptions,
  Interceptor,
  InterceptorTransformObject,
  Middleware,
  MiddlewareHandler,
  Pipe,
  PipeMetadata,
  RequestHandler,
  RequiredOptions,
  RouteParamOptions,
  RouteParams,
  RouterParams,
};

export {
  AcceptedHttpResponse,
  All,
  AlreadyReportedHttpResponse,
  ApplyMiddleware,
  BadGatewayHttpResponse,
  BadRequestHttpResponse,
  Body,
  buildNormalizedPath,
  CatchError,
  ConflictHttpResponse,
  ContentDifferentHttpResponse,
  Controller,
  Cookies,
  createCustomNativeParameterDecorator,
  createCustomParameterDecorator,
  createRouteValueMetadataUtils,
  CreatedHttpResponse,
  Delete,
  ErrorHttpResponse,
  ForbiddenHttpResponse,
  GatewayTimeoutHttpResponse,
  Get,
  getControllerMetadataList,
  getControllerMethodMetadataList,
  GoneHttpResponse,
  handleMiddlewareList,
  Head,
  Headers,
  HttpResponse,
  httpApplicationServiceIdentifier,
  HttpStatusCode,
  HttpVersionNotSupportedHttpResponse,
  InsufficientStorageHttpResponse,
  InternalServerErrorHttpResponse,
  InversifyHttpAdapter,
  isHttpResponse,
  isHttpResponseSymbol,
  LoopDetectedHttpResponse,
  MethodNotAllowedHttpResponse,
  MiddlewarePhase,
  MultiStatusHttpResponse,
  Next,
  NoContentHttpResponse,
  NonAuthoritativeInformationHttpResponse,
  NotAcceptableHttpResponse,
  NotFoundHttpResponse,
  NotImplementedHttpResponse,
  OkHttpResponse,
  Options,
  Params,
  PartialContentHttpResponse,
  Patch,
  PaymentRequiredHttpResponse,
  Post,
  Put,
  Query,
  Request,
  RequestMethodParameterType,
  RequestMethodType,
  ResetContentHttpResponse,
  Response,
  routeValueMetadata,
  routeValueMetadataSymbol,
  ServiceUnavailableHttpResponse,
  SetHeader,
  SuccessHttpResponse,
  StatusCode,
  UnauthorizedHttpResponse,
  UnprocessableEntityHttpResponse,
  UseErrorFilter,
  UseGuard,
  UseInterceptor,
};
