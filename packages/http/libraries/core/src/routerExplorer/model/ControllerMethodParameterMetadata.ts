import { CustomParameterDecoratorHandler } from '../../http/models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../../http/models/RequestMethodParameterType';

export interface ControllerMethodParameterMetadata<
  TRequest = unknown,
  TResponse = unknown,
  TResult = unknown,
> {
  customParameterDecoratorHandler?:
    | CustomParameterDecoratorHandler<TRequest, TResponse, TResult>
    | undefined;
  parameterType: RequestMethodParameterType;
  parameterName?: string | undefined;
}
