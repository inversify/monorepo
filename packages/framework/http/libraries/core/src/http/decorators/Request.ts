import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { buildRouteParameterDecorator } from '../calculations/buildRouteParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Request(
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRouteParameterDecorator(
    RequestMethodParameterType.Request,
    parameterPipeList,
  );
}
