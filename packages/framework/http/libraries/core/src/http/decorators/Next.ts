import { buildRouteParameterDecorator } from '../calculations/buildRouteParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Next(): ParameterDecorator {
  return buildRouteParameterDecorator(RequestMethodParameterType.Next, []);
}
