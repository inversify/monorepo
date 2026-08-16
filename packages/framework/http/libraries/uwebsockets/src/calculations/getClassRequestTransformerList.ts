import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { classRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classRequestTransformerMetadataReflectKey.js';

export function getClassRequestTransformerList(
  classConstructor: NewableFunction,
): RequestTransformer<HttpRequest, HttpResponse>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classRequestTransformerMetadataReflectKey,
    ) ?? []
  );
}
