import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { Controller } from '../models/Controller';
import { ControllerFunction } from '../models/ControllerFunction';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function requestParam(
  controllerMethodParameterMetadata: ControllerMethodParameterMetadata,
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
      | (ControllerMethodParameterMetadata | undefined)[]
      | undefined = getReflectMetadata(
      controllerFunction,
      controllerMethodParameterMetadataReflectKey,
    );

    if (parameterMetadataList === undefined) {
      parameterMetadataList = [];
    }

    parameterMetadataList[index] = controllerMethodParameterMetadata;

    setReflectMetadata(
      controllerFunction,
      controllerMethodParameterMetadataReflectKey,
      parameterMetadataList,
    );

    if (
      controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.NEXT ||
      controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.RESPONSE
    ) {
      setReflectMetadata(
        controllerFunction,
        controllerMethodUseNativeHandlerMetadataReflectKey,
        true,
      );
    }
  };
}
