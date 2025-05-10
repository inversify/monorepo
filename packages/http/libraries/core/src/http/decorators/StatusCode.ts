import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { HttpStatusCode } from '../responses/HttpStatusCode';

export function statusCode(statusCode: HttpStatusCode): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    setReflectMetadata(
      target.constructor,
      controllerMethodStatusCodeMetadataReflectKey,
      statusCode,
      key,
    );
  };
}
