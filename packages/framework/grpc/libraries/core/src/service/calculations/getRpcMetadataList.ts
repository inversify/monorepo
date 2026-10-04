import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { rpcMetadataReflectKey } from '../../reflectMetadata/data/rpcMetadataReflectKey.js';
import { type RpcMetadata } from '../models/RpcMetadata.js';

export function getRpcMetadataList(
  classConstructor: NewableFunction,
): RpcMetadata[] {
  const metadataList: RpcMetadata[] = [];
  const seenNames: Set<string> = new Set();
  let currentType: Newable | undefined = classConstructor as Newable;

  while (
    currentType !== undefined &&
    currentType !== Object &&
    currentType !== Function
  ) {
    const ownMetadataList: RpcMetadata[] | undefined = getOwnReflectMetadata(
      currentType,
      rpcMetadataReflectKey,
    );

    if (ownMetadataList !== undefined) {
      const ownNames: Set<string> = new Set();

      for (const metadata of ownMetadataList) {
        if (ownNames.has(metadata.name)) {
          throw new InversifyGrpcAdapterError(
            InversifyGrpcAdapterErrorKind.invalidRpc,
            `Duplicate @RPC("${metadata.name}") on ${currentType.name}`,
          );
        }

        ownNames.add(metadata.name);

        if (!seenNames.has(metadata.name)) {
          seenNames.add(metadata.name);
          metadataList.push(metadata);
        }
      }
    }

    currentType = getBaseType(currentType);
  }

  return metadataList;
}
