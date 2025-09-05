import {
  buildArrayMetadataWithIndex,
  buildEmptyArrayMetadata,
  setReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function requestParam(
  controllerMethodParameterMetadata: ControllerMethodParameterMetadata,
): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    if (key === undefined) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.requestParamIncorrectUse,
        'Expected param decorator to be used on a method parameter. Instead, it was found on a constructor parameter',
      );
    }

    updateOwnReflectMetadata(
      target.constructor,
      controllerMethodParameterMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithIndex(controllerMethodParameterMetadata, index),
      key,
    );

    if (
      controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.Next ||
      controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.Response
    ) {
      setReflectMetadata(
        target.constructor,
        controllerMethodUseNativeHandlerMetadataReflectKey,
        true,
        key,
      );
    }
  };
}
