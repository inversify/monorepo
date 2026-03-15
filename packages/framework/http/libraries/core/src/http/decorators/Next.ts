import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata.js';
import { nativeRequestParam } from '../calculations/nativeRequestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Next(): ParameterDecorator {
  return nativeRequestParam(
    buildNonCustomControllerMethodParameterMetadata(
      RequestMethodParameterType.Next,
      [],
      undefined,
    ),
  );
}
