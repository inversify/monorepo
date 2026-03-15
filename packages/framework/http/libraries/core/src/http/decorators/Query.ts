import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata.js';
import { getOptionsAndPipes } from '../calculations/getOptionsAndPipes.js';
import { requestParam } from '../calculations/requestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { type RouteParamOptions } from '../models/RouteParamOptions.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Query(
  optionsOrPipe?: RouteParamOptions | (ServiceIdentifier<Pipe> | Pipe),
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  const [options, pipeList]: [
    RouteParamOptions | undefined,
    (ServiceIdentifier<Pipe> | Pipe)[],
  ] = getOptionsAndPipes(optionsOrPipe, parameterPipeList);

  return requestParam(
    buildNonCustomControllerMethodParameterMetadata(
      RequestMethodParameterType.Query,
      pipeList,
      options,
    ),
  );
}
