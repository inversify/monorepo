import { setControllerMethodRequestTransformerList } from '../actions/setControllerMethodRequestTransformerList.js';
import { buildCaptureRequestValuesTransformer } from '../calculations/buildCaptureRequestValuesTransformer.js';
import { type RequestValueKind } from '../models/RequestValueKind.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CaptureRequestValues(
  requestValueKindList: RequestValueKind[],
): MethodDecorator {
  return (target: object, methodKey: string | symbol): void => {
    setControllerMethodRequestTransformerList(target.constructor, methodKey, [
      buildCaptureRequestValuesTransformer(
        target.constructor,
        methodKey,
        requestValueKindList,
      ),
    ]);
  };
}
