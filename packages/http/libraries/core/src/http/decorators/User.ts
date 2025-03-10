import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { requestParam } from './RequestParam';

export function user(): ParameterDecorator {
  return requestParam(RequestMethodParameterType.USER);
}
