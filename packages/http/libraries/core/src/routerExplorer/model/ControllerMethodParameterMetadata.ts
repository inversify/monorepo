/* eslint-disable @typescript-eslint/no-explicit-any */
import { Newable } from 'inversify';

import { CustomParameterDecoratorHandler } from '../../http/models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../../http/models/RequestMethodParameterType';
import { Pipe } from '../../http/pipe/model/Pipe';

export interface ControllerMethodParameterMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> {
  customParameterDecoratorHandler?:
    | CustomParameterDecoratorHandler<TRequest, TResponse, TResult>
    | undefined;
  parameterType: RequestMethodParameterType;
  parameterName?: string | undefined;
  pipeList: (Newable<Pipe> | Pipe)[];
}
