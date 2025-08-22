import { Pipe } from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Response(
  ...parameterPipeList: (Newable<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRequestParameterDecorator(
    RequestMethodParameterType.Response,
    parameterPipeList,
  );
}
