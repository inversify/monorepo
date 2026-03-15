import { isPipe, type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type RouteParamOptions } from '../models/RouteParamOptions.js';

export function getOptionsAndPipes(
  optionsOrPipe:
    | RouteParamOptions
    | (ServiceIdentifier<Pipe> | Pipe)
    | undefined,
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
): [RouteParamOptions | undefined, (ServiceIdentifier<Pipe> | Pipe)[]] {
  let options: RouteParamOptions | undefined;
  const pipeList: (ServiceIdentifier<Pipe> | Pipe)[] = [];

  if (optionsOrPipe !== undefined) {
    if (typeof optionsOrPipe === 'object' && !isPipe(optionsOrPipe)) {
      options = optionsOrPipe;
    } else {
      pipeList.push(optionsOrPipe);
    }
  }

  pipeList.push(...parameterPipeList);

  return [options, pipeList];
}
