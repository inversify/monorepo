import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { requestTransformerMetadataReflectKey } from '../reflectMetadata/data/requestTransformerMetadataReflectKey.js';

export function setControllerMethodRequestTransformerList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
  requestTransformerList: RequestTransformer[],
): void {
  updateOwnReflectMetadata<RequestTransformer[]>(
    controllerConstructor,
    requestTransformerMetadataReflectKey,
    buildEmptyArrayMetadata,
    buildArrayMetadataWithArray(requestTransformerList),
    methodKey,
  );
}
