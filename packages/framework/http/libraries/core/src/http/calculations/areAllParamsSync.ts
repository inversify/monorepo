import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type RequestMethodParameterType } from '../models/RequestMethodParameterType.js';

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
