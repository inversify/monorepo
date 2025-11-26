import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata';
import { requestParam } from '../calculations/requestParam';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

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
