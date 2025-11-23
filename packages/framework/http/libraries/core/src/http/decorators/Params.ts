import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata';
import { getOptionsAndPipes } from '../calculations/getOptionsAndPipes';
import { requestParam } from '../calculations/requestParam';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Params(
  optionsOrPipe?: RouteParamOptions | (ServiceIdentifier<Pipe> | Pipe),
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  const [options, pipeList]: [
    RouteParamOptions | undefined,
    (ServiceIdentifier<Pipe> | Pipe)[],
  ] = getOptionsAndPipes(optionsOrPipe, parameterPipeList);

  return requestParam(
    buildNonCustomControllerMethodParameterMetadata(
      RequestMethodParameterType.Params,
      pipeList,
      options,
    ),
  );
}
