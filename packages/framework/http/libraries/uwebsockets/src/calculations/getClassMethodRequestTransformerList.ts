import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { classMethodRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classMethodRequestTransformerMetadataReflectKey.js';

export function getClassMethodRequestTransformerList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): RequestTransformer<HttpRequest, HttpResponse>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodRequestTransformerMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
