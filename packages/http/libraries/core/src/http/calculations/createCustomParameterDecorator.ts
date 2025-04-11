import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { Controller } from '../models/Controller';
import { ControllerFunction } from '../models/ControllerFunction';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function createCustomParameterDecorator<TRequest, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TRequest, TResponse, TResult>,
): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    let controllerFunction: ControllerFunction | undefined = undefined;

    if (key !== undefined) {
      controllerFunction = (target as Controller)[key];
    }

    if (controllerFunction === undefined) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.requestParamIncorrectUse,
      );
    }

    let parameterMetadataList:
      | ControllerMethodParameterMetadata<TRequest, TResponse, TResult>[]
      | undefined = getReflectMetadata(
      controllerFunction,
      controllerMethodParameterMetadataReflectKey,
    );

    const controllerMethodParameterMetadata: ControllerMethodParameterMetadata<
      TRequest,
      TResponse,
      TResult
    > = {
      customParameterDecoratorHandler: handler,
      parameterType: RequestMethodParameterType.CUSTOM,
    };

    if (parameterMetadataList === undefined) {
      parameterMetadataList = [];
    }

    parameterMetadataList[index] = controllerMethodParameterMetadata;

    setReflectMetadata(
      controllerFunction,
      controllerMethodParameterMetadataReflectKey,
      parameterMetadataList,
    );
  };
}
