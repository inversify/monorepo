import { Newable } from 'inversify';

import { CustomParameterDecoratorHandler } from '../../http/models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../../http/models/RequestMethodParameterType';
import { Pipe } from '../../http/pipe/model/Pipe';

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
  pipeList: (Newable<Pipe> | Pipe)[];
}
