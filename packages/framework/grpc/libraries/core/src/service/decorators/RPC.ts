import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { rpcMetadataReflectKey } from '../../reflectMetadata/data/rpcMetadataReflectKey.js';
import { type RpcMetadata } from '../models/RpcMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function RPC(name: string): MethodDecorator {
  return (target: object, methodKey: string | symbol): void => {
    if (name.length === 0) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.invalidRpc,
        '@RPC() requires a non-empty name',
      );
    }

    const rpcMetadata: RpcMetadata = {
      methodKey,
      name,
    };

    updateOwnReflectMetadata(
      target.constructor,
      rpcMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(rpcMetadata),
    );
  };
}
