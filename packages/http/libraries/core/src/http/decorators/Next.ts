import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function next(): ParameterDecorator {
  return buildRequestParameterDecorator(RequestMethodParameterType.NEXT, []);
}
