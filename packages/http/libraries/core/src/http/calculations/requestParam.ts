import {
  setReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { buildArrayMetadataWithIndex } from './buildArrayMetadataWithIndex';
import { buildDefaultArrayMetadata } from './buildDefaultArrayMetadata';

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
      );
    }

    updateOwnReflectMetadata(
      target.constructor,
      controllerMethodParameterMetadataReflectKey,
      buildDefaultArrayMetadata,
      buildArrayMetadataWithIndex(controllerMethodParameterMetadata, index),
      key,
    );

    if (
      controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.NEXT ||
      controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.RESPONSE
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
