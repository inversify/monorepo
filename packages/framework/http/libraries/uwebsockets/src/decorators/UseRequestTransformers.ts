import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { classMethodRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classMethodRequestTransformerMetadataReflectKey.js';
import { classRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classRequestTransformerMetadataReflectKey.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseRequestTransformers(
  ...requestTransformerList: RequestTransformer<HttpRequest, HttpResponse>[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = classRequestTransformerMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = classMethodRequestTransformerMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithArray(requestTransformerList),
      key,
    );
  };
}
