import {
  applyPipeList,
  type Pipe,
  type PipeMetadata,
} from '@inversifyjs/framework-core';
import { type Container, type ServiceIdentifier } from 'inversify';

import { type RpcParameterMetadata } from '../../service/models/RpcParameterMetadata.js';
import { RpcParameterType } from '../../service/models/RpcParameterType.js';
import { type RpcParamsBuilder } from '../models/RpcParamsBuilder.js';

interface RpcParamBuilder {
  build: (call: unknown, callback: unknown, response: unknown) => unknown;
  isAwaitable: boolean;
  pipeList: (ServiceIdentifier<Pipe> | Pipe)[];
  pipeMetadata: PipeMetadata;
}

function buildParamValueBuilder(
  parameterMetadata: RpcParameterMetadata,
): (call: unknown, callback: unknown, response: unknown) => unknown {
  switch (parameterMetadata.parameterType) {
    case RpcParameterType.Call:
      return (call: unknown): unknown => call;
    case RpcParameterType.Callback:
      return (_call: unknown, callback: unknown): unknown => callback;
    case RpcParameterType.Custom:
      return (call: unknown, _callback: unknown, response: unknown): unknown =>
        parameterMetadata.customParameterDecoratorHandler(call, response);
  }
}

export function buildRpcParamsBuilder(
  container: Container,
  globalPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  targetClass: NewableFunction,
  methodKey: string | symbol,
  parameterMetadataList: (RpcParameterMetadata | undefined)[],
): RpcParamsBuilder | undefined {
  if (parameterMetadataList.length === 0) {
    return undefined;
  }

  const paramBuilderList: (RpcParamBuilder | undefined)[] = [];

  for (let index: number = 0; index < parameterMetadataList.length; ++index) {
    const parameterMetadata: RpcParameterMetadata | undefined =
      parameterMetadataList[index];

    paramBuilderList.push(
      parameterMetadata === undefined
        ? undefined
        : {
            build: buildParamValueBuilder(parameterMetadata),
            isAwaitable:
              parameterMetadata.parameterType === RpcParameterType.Custom,
            pipeList: [...globalPipeList, ...parameterMetadata.pipeList],
            pipeMetadata: {
              methodName: methodKey,
              parameterIndex: index,
              targetClass,
            },
          },
    );
  }

  const areAllParamsSync: boolean = paramBuilderList.every(
    (paramBuilder: RpcParamBuilder | undefined): boolean =>
      paramBuilder === undefined ||
      (!paramBuilder.isAwaitable && paramBuilder.pipeList.length === 0),
  );

  if (areAllParamsSync) {
    return (call: unknown, callback: unknown, response: unknown): unknown[] =>
      paramBuilderList.map(
        (paramBuilder: RpcParamBuilder | undefined): unknown =>
          paramBuilder?.build(call, callback, response),
      );
  }

  return async (
    call: unknown,
    callback: unknown,
    response: unknown,
  ): Promise<unknown[]> => {
    const params: unknown[] = new Array(paramBuilderList.length);

    await Promise.all(
      paramBuilderList.map(
        async (
          paramBuilder: RpcParamBuilder | undefined,
          index: number,
        ): Promise<void> => {
          if (paramBuilder === undefined) {
            return;
          }

          params[index] = await paramBuilder.build(call, callback, response);

          if (paramBuilder.pipeList.length > 0) {
            await applyPipeList(
              container,
              params,
              paramBuilder.pipeList,
              paramBuilder.pipeMetadata,
            );
          }
        },
      ),
    );

    return params;
  };
}
