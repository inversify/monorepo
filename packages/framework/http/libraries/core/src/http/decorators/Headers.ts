import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { buildRouteParameterDecorator } from '../calculations/buildRouteParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Headers(
  optionsOrPipe?: RouteParamOptions | (ServiceIdentifier<Pipe> | Pipe),
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRouteParameterDecorator(
    RequestMethodParameterType.Headers,
    parameterPipeList,
    optionsOrPipe,
  );
}
