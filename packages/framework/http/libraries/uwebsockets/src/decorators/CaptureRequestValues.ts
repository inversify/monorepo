import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  getOwnReflectMetadata,
  setReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { buildCaptureRequestValuesTransformer } from '../calculations/buildCaptureRequestValuesTransformer.js';
import { type CaptureRequestValuesOptions } from '../models/CaptureRequestValuesOptions.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { captureRequestValuesMetadataReflectKey } from '../reflectMetadata/data/captureRequestValuesMetadataReflectKey.js';
import { classMethodRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classMethodRequestTransformerMetadataReflectKey.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CaptureRequestValues(
  options: CaptureRequestValuesOptions,
): MethodDecorator {
  return (target: object, methodKey: string | symbol): void => {
    const controllerConstructor: NewableFunction = target.constructor;

    if (
      getOwnReflectMetadata(
        controllerConstructor,
        captureRequestValuesMetadataReflectKey,
        methodKey,
      ) !== undefined
    ) {
      throw new Error(
        `@CaptureRequestValues() cannot be applied more than once to "${controllerConstructor.name}.${String(methodKey)}".`,
      );
    }

    setReflectMetadata(
      controllerConstructor,
      captureRequestValuesMetadataReflectKey,
      options,
      methodKey,
    );

    const requestTransformer: RequestTransformer<HttpRequest, HttpResponse> =
      buildCaptureRequestValuesTransformer(options);

    updateOwnReflectMetadata(
      controllerConstructor,
      classMethodRequestTransformerMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithArray([requestTransformer]),
      methodKey,
    );
  };
}
