import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata.js';
import { nativeRequestParam } from '../calculations/nativeRequestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Response(
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return nativeRequestParam(
    buildNonCustomControllerMethodParameterMetadata(
      RequestMethodParameterType.Response,
      parameterPipeList,
      undefined,
    ),
  );
}
