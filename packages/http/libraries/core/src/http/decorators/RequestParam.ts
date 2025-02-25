import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { Controller } from '../models/Controller';
import { ControllerFunction } from '../models/ControllerFunction';
import { ControllerMethodParameterMetadata } from '../models/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function requestParam(
  parameterType: RequestMethodParameterType,
  parameterName?: string,
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

    let parameterMetadataList: ControllerMethodParameterMetadata[] | undefined =
      getReflectMetadata(
        controllerFunction,
        controllerMethodParameterMetadataReflectKey,
      );

    const controllerMethodParameterMetadata: ControllerMethodParameterMetadata =
      {
        index,
        parameterName,
        parameterType,
      };

    if (parameterMetadataList === undefined) {
      parameterMetadataList = [controllerMethodParameterMetadata];
    } else {
      insertParameterMetadata(
        parameterMetadataList,
        controllerMethodParameterMetadata,
      );
    }

    setReflectMetadata(
      controllerFunction,
      controllerMethodParameterMetadataReflectKey,
      parameterMetadataList,
    );
  };
}

function insertParameterMetadata(
  parameterMetadataList: ControllerMethodParameterMetadata[],
  newParameterMetadata: ControllerMethodParameterMetadata,
): void {
  let i: number = 0;

  while (
    i < parameterMetadataList.length &&
    (parameterMetadataList[i] as ControllerMethodParameterMetadata).index <
      newParameterMetadata.index
  ) {
    i++;
  }

  parameterMetadataList.splice(i, 0, newParameterMetadata);
}
