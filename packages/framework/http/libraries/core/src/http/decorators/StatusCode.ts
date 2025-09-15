import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { HttpStatusCode } from '../models/HttpStatusCode';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function StatusCode(statusCode: HttpStatusCode): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    setReflectMetadata(
      target.constructor,
      controllerMethodStatusCodeMetadataReflectKey,
      statusCode,
      key,
    );
  };
}
