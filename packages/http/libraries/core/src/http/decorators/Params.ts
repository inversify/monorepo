import { Newable } from 'inversify';

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Pipe } from '../pipe/model/Pipe';

export function params(
  parameterNameOrPipe?: string | (Newable<Pipe> | Pipe),
  ...parameterPipeList: (Newable<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRequestParameterDecorator(
    RequestMethodParameterType.PARAMS,
    parameterPipeList,
    parameterNameOrPipe,
  );
}
