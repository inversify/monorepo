import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Next(): ParameterDecorator {
  return buildRequestParameterDecorator(RequestMethodParameterType.Next, []);
}
