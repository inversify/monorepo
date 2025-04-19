import { Newable } from 'inversify';

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Pipe } from '../pipe/model/Pipe';

export function response(
  ...parameterPipeList: (Newable<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRequestParameterDecorator(
    RequestMethodParameterType.RESPONSE,
    parameterPipeList,
  );
}
