import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function areAllParamsSync(
  awaitableRequestMethodParamTypes: Set<RequestMethodParameterType>,
  controllerMethodParameterMetadataList: (
    | ControllerMethodParameterMetadata
    | undefined
  )[],
  globalPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
): boolean {
  return (
    globalPipeList.length === 0 &&
    controllerMethodParameterMetadataList.every(
      (
        controllerMethodParameterMetadata:
          | ControllerMethodParameterMetadata
          | undefined,
      ): boolean =>
        controllerMethodParameterMetadata === undefined ||
        (controllerMethodParameterMetadata.pipeList.length === 0 &&
          !awaitableRequestMethodParamTypes.has(
            controllerMethodParameterMetadata.parameterType,
          )),
    )
  );
}
