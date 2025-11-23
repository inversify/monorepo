import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata';
import { nativeRequestParam } from '../calculations/nativeRequestParam';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

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
