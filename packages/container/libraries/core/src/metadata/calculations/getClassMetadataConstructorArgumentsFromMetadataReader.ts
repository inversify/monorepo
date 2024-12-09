import { Newable } from '@inversifyjs/common';

import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { LegacyConstructorMetadata } from '../models/LegacyConstructorMetadata';
import { LegacyMetadataReader } from '../models/LegacyMetadataReader';
import { assertConstructorMetadataArrayFilled } from './assertConstructorMetadataArrayFilled';
import { getClassElementMetadataFromNewable } from './getClassElementMetadataFromNewable';
import { getConstructorArgumentMetadataFromLegacyMetadata } from './getConstructorArgumentMetadataFromLegacyMetadata';

export function getClassMetadataConstructorArgumentsFromMetadataReader(
  type: Newable,
  metadataReader: LegacyMetadataReader,
): ClassElementMetadata[] {
  const legacyConstructorMetadata: LegacyConstructorMetadata =
    metadataReader.getConstructorMetadata(type);

  const constructorArgumentsMetadata: (ClassElementMetadata | undefined)[] = [];

  for (const [stringifiedIndex, metadataList] of Object.entries(
    legacyConstructorMetadata.userGeneratedMetadata,
  )) {
    const index: number = parseInt(stringifiedIndex);

    constructorArgumentsMetadata[index] =
      getConstructorArgumentMetadataFromLegacyMetadata(
        type,
        index,
        metadataList,
      );
  }

  if (legacyConstructorMetadata.compilerGeneratedMetadata !== undefined) {
    for (
      let i: number = 0;
      i < legacyConstructorMetadata.compilerGeneratedMetadata.length;
      ++i
    ) {
      if (constructorArgumentsMetadata[i] === undefined) {
        const typescriptMetadata: Newable = legacyConstructorMetadata
          .compilerGeneratedMetadata[i] as Newable;

        constructorArgumentsMetadata[i] =
          getClassElementMetadataFromNewable(typescriptMetadata);
      }
    }
  }

  assertConstructorMetadataArrayFilled(type, constructorArgumentsMetadata);

  return constructorArgumentsMetadata;
}
