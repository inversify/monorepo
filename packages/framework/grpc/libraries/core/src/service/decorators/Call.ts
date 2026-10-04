import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { rpcParameter } from '../calculations/rpcParameter.js';
import { RpcParameterType } from '../models/RpcParameterType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Call(
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return rpcParameter({
    parameterType: RpcParameterType.Call,
    pipeList: parameterPipeList,
  });
}
