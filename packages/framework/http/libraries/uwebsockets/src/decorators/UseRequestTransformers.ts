import { setControllerMethodRequestTransformerList } from '../actions/setControllerMethodRequestTransformerList.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseRequestTransformers(
  ...requestTransformerList: RequestTransformer[]
): MethodDecorator {
  return (target: object, methodKey: string | symbol): void => {
    setControllerMethodRequestTransformerList(
      target.constructor,
      methodKey,
      requestTransformerList,
    );
  };
}
