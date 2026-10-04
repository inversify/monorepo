import {
  buildArrayMetadataWithIndex,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { rpcParameterMetadataReflectKey } from '../../reflectMetadata/data/rpcParameterMetadataReflectKey.js';
import { type RpcParameterMetadata } from '../models/RpcParameterMetadata.js';

export function rpcParameter(
  rpcParameterMetadata: RpcParameterMetadata,
): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    if (key === undefined) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.rpcParameterIncorrectUse,
        'Expected an RPC parameter decorator on a method parameter, but it was found on a constructor parameter',
      );
    }

    updateOwnReflectMetadata(
      target.constructor,
      rpcParameterMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithIndex(rpcParameterMetadata, index),
      key,
    );
  };
}
