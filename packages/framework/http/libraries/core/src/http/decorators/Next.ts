import { buildNonCustomControllerMethodParameterMetadata } from '../calculations/buildNonCustomControllerMethodParameterMetadata';
import { nativeRequestParam } from '../calculations/nativeRequestParam';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

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
