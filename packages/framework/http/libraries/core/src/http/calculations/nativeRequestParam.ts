import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError.js';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind.js';
import { setControllerMethodParameterMetadata } from '../../routerExplorer/actions/setControllerMethodParameterMetadata.js';
import { setControllerMethodUseNativeHandlerMetadata } from '../../routerExplorer/actions/setControllerMethodUseNativeHandlerMetadata.js';
import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';

export function nativeRequestParam(
  controllerMethodParameterMetadata: ControllerMethodParameterMetadata,
): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    if (key === undefined) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.requestParamIncorrectUse,
        'Expected native param decorator to be used on a method parameter. Instead, it was found on a constructor parameter',
      );
    }

    setControllerMethodParameterMetadata(
      controllerMethodParameterMetadata,
      target.constructor,
      key,
      index,
    );
    setControllerMethodUseNativeHandlerMetadata(target.constructor, key);
  };
}
