import { findInPrototypeChain } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { rpcParameterMetadataReflectKey } from '../../reflectMetadata/data/rpcParameterMetadataReflectKey.js';
import { type RpcParameterMetadata } from '../models/RpcParameterMetadata.js';

export function getRpcParameterMetadataList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): (RpcParameterMetadata | undefined)[] {
  return (
    findInPrototypeChain<(RpcParameterMetadata | undefined)[]>(
      classConstructor as Newable,
      (type: Newable): (RpcParameterMetadata | undefined)[] | undefined =>
        getOwnReflectMetadata(type, rpcParameterMetadataReflectKey, methodKey),
    ) ?? []
  );
}
