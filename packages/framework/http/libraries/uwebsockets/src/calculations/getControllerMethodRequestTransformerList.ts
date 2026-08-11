import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { requestTransformerMetadataReflectKey } from '../reflectMetadata/data/requestTransformerMetadataReflectKey.js';

export function getControllerMethodRequestTransformerList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): RequestTransformer[] | undefined {
  const requestTransformerList: RequestTransformer[] | undefined =
    getReflectMetadata(
      controllerConstructor,
      requestTransformerMetadataReflectKey,
      methodKey,
    );

  if (
    requestTransformerList === undefined ||
    requestTransformerList.length === 0
  ) {
    return undefined;
  }

  return requestTransformerList;
}
