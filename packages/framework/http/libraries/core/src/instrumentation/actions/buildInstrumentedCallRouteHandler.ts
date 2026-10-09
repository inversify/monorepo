import { isPipe, type Pipe } from '@inversifyjs/framework-core';
import {
  type HttpInstrumentationContext,
  type HttpInstrumentationScope,
  type HttpStageClock,
  type HttpStageOutcome,
  readHttpStageDuration,
  runInstrumentedHttpStage,
} from '@inversifyjs/http-instrumentation-core';
import { type Container, type ServiceIdentifier } from 'inversify';

import { type Controller } from '../../http/models/Controller.js';
import { type ControllerFunction } from '../../http/models/ControllerFunction.js';
import { type ControllerResponse } from '../../http/models/ControllerResponse.js';
import { type RequestMethodParameterType } from '../../http/models/RequestMethodParameterType.js';
import {
  describeMethodKey,
  describePipe,
} from '../calculations/describeServiceIdentifier.js';

interface InstrumentedParameterMetadata {
  parameterType: RequestMethodParameterType;
  pipeList: (ServiceIdentifier<Pipe> | Pipe)[];
}

type ParamBuilder<TRequest, TResponse, TNextFunction> = (
  request: TRequest,
  response: TResponse,
  next: TNextFunction,
) => unknown;

export function buildInstrumentedParameterlessCallRouteHandler(
  instrumentation: HttpInstrumentationContext,
  container: Container,
  serviceIdentifier: ServiceIdentifier,
  controllerName: string,
  controllerMethodKey: string | symbol,
): (request: object) => Promise<ControllerResponse> {
  const methodName: string = describeMethodKey(controllerMethodKey);

  return async (request: object): Promise<ControllerResponse> => {
    const controller: Controller = await container.getAsync<Controller>(
      serviceIdentifier as ServiceIdentifier<Controller>,
    );

    return runInstrumentedController(
      instrumentation,
      request,
      controllerName,
      methodName,
      async (): Promise<ControllerResponse> =>
        (controller[controllerMethodKey] as ControllerFunction)(),
    );
  };
}

export function buildInstrumentedSyncCallRouteHandler<
  TRequest,
  TResponse,
  TNextFunction,
>(
  instrumentation: HttpInstrumentationContext,
  container: Container,
  serviceIdentifier: ServiceIdentifier,
  controllerName: string,
  controllerMethodKey: string | symbol,
  paramBuilders: (
    ParamBuilder<TRequest, TResponse, TNextFunction> | undefined
  )[],
): (
  request: TRequest,
  response: TResponse,
  next: TNextFunction,
) => Promise<ControllerResponse> {
  const methodName: string = describeMethodKey(controllerMethodKey);

  return async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<ControllerResponse> => {
    const controller: Controller = await container.getAsync<Controller>(
      serviceIdentifier as ServiceIdentifier<Controller>,
    );
    const params: unknown[] = new Array(paramBuilders.length);

    for (let index: number = 0; index < paramBuilders.length; index++) {
      const paramBuilder:
        ParamBuilder<TRequest, TResponse, TNextFunction> | undefined =
        paramBuilders[index];

      if (paramBuilder !== undefined) {
        params[index] = paramBuilder(request, response, next);
      }
    }

    return runInstrumentedController(
      instrumentation,
      request as object,
      controllerName,
      methodName,
      async (): Promise<ControllerResponse> =>
        (controller[controllerMethodKey] as ControllerFunction)(...params),
    );
  };
}

export function buildInstrumentedAsyncCallRouteHandler<
  TRequest,
  TResponse,
  TNextFunction,
>(
  instrumentation: HttpInstrumentationContext,
  container: Container,
  awaitableRequestMethodParamTypes: ReadonlySet<RequestMethodParameterType>,
  globalPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  targetClass: NewableFunction,
  controllerMethodKey: string | symbol,
  controllerMethodParameterMetadataList: (
    InstrumentedParameterMetadata | undefined
  )[],
  serviceIdentifier: ServiceIdentifier,
  paramBuilders: (
    ParamBuilder<TRequest, TResponse, TNextFunction> | undefined
  )[],
): (
  request: TRequest,
  response: TResponse,
  next: TNextFunction,
) => Promise<ControllerResponse> {
  const controllerName: string = describeControllerName(targetClass);
  const methodName: string = describeMethodKey(controllerMethodKey);

  return async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<ControllerResponse> => {
    const params: unknown[] = new Array(
      controllerMethodParameterMetadataList.length,
    );
    const builders: ParamBuilder<TRequest, TResponse, TNextFunction>[] =
      paramBuilders as ParamBuilder<TRequest, TResponse, TNextFunction>[];

    for (let index: number = 0; index < builders.length; index += 1) {
      const paramBuilder: ParamBuilder<TRequest, TResponse, TNextFunction> =
        builders[index] as ParamBuilder<TRequest, TResponse, TNextFunction>;
      const controllerMethodParameterMetadata: InstrumentedParameterMetadata =
        controllerMethodParameterMetadataList[
          index
        ] as InstrumentedParameterMetadata;
      const param: unknown = paramBuilder(request, response, next);

      params[index] = awaitableRequestMethodParamTypes.has(
        controllerMethodParameterMetadata.parameterType,
      )
        ? await param
        : param;

      const pipeList: (ServiceIdentifier<Pipe> | Pipe)[] = [
        ...globalPipeList,
        ...controllerMethodParameterMetadata.pipeList,
      ];

      for (const pipeOrServiceIdentifier of pipeList) {
        const pipe: Pipe = isPipe(pipeOrServiceIdentifier)
          ? pipeOrServiceIdentifier
          : await container.getAsync(pipeOrServiceIdentifier);

        await runInstrumentedHttpStage(
          instrumentation,
          request as object,
          (scope: HttpInstrumentationScope, stage: HttpStageClock) => ({
            executionId: scope.executionId,
            method: methodName,
            parameterIndex: index,
            ...(scope.parentExecutionId === undefined
              ? {}
              : { parentExecutionId: scope.parentExecutionId }),
            pipe: describePipe(pipeOrServiceIdentifier),
            requestId: scope.requestId,
            timestamp: stage.startedAt,
            type: 'http.pipe.started',
          }),
          async (): Promise<void> => {
            params[index] = await pipe.execute(params[index], {
              methodName: controllerMethodKey,
              parameterIndex: index,
              targetClass,
            });
          },
          (
            scope: HttpInstrumentationScope,
            stage: HttpStageClock,
            outcome: HttpStageOutcome<void>,
          ) => ({
            duration: readHttpStageDuration(stage),
            ...('error' in outcome ? { error: outcome.error } : {}),
            executionId: scope.executionId,
            method: methodName,
            parameterIndex: index,
            ...(scope.parentExecutionId === undefined
              ? {}
              : { parentExecutionId: scope.parentExecutionId }),
            pipe: describePipe(pipeOrServiceIdentifier),
            requestId: scope.requestId,
            startedAt: stage.startedAt,
            timestamp: Date.now(),
            type: 'http.pipe.executed',
          }),
          async (error: unknown): Promise<void> => {
            throw error;
          },
        );
      }
    }

    const controller: Controller = await container.getAsync<Controller>(
      serviceIdentifier as ServiceIdentifier<Controller>,
    );

    return runInstrumentedController(
      instrumentation,
      request as object,
      controllerName,
      methodName,
      async (): Promise<ControllerResponse> =>
        (controller[controllerMethodKey] as ControllerFunction)(...params),
    );
  };
}

function describeControllerName(targetClass: NewableFunction): string {
  return targetClass.name === '' ? 'anonymous' : targetClass.name;
}

async function runInstrumentedController(
  instrumentation: HttpInstrumentationContext,
  request: object,
  controllerName: string,
  methodName: string,
  operation: () => Promise<ControllerResponse>,
): Promise<ControllerResponse> {
  return runInstrumentedHttpStage(
    instrumentation,
    request,
    (scope: HttpInstrumentationScope, stage: HttpStageClock) => ({
      controller: controllerName,
      executionId: scope.executionId,
      method: methodName,
      ...(scope.parentExecutionId === undefined
        ? {}
        : { parentExecutionId: scope.parentExecutionId }),
      requestId: scope.requestId,
      timestamp: stage.startedAt,
      type: 'http.controller.started',
    }),
    operation,
    (
      scope: HttpInstrumentationScope,
      stage: HttpStageClock,
      outcome: HttpStageOutcome<ControllerResponse>,
    ) => ({
      controller: controllerName,
      duration: readHttpStageDuration(stage),
      ...('error' in outcome ? { error: outcome.error } : {}),
      executionId: scope.executionId,
      method: methodName,
      ...(scope.parentExecutionId === undefined
        ? {}
        : { parentExecutionId: scope.parentExecutionId }),
      requestId: scope.requestId,
      startedAt: stage.startedAt,
      timestamp: Date.now(),
      type: 'http.controller.executed',
    }),
    async (error: unknown): Promise<ControllerResponse> => {
      throw error;
    },
  );
}

export function readControllerName(targetClass: NewableFunction): string {
  return describeControllerName(targetClass);
}
