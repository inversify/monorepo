import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata.js';
import { requestParam } from '../calculations/requestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Request(
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return requestParam(
    buildNonCustomControllerMethodParameterMetadata(
      RequestMethodParameterType.Request,
      parameterPipeList,
      undefined,
    ),
  );
}
