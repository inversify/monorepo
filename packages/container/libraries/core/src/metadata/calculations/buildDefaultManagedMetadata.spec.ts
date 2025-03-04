import { beforeAll, describe, expect, it } from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { buildDefaultManagedMetadata } from './buildDefaultManagedMetadata';

describe(buildDefaultManagedMetadata.name, () => {
  let metadataKindFixture: ClassElementMetadataKind.singleInjection;
  let serviceIdentifierFixture: ServiceIdentifier;

  beforeAll(() => {
    metadataKindFixture = ClassElementMetadataKind.singleInjection;
    serviceIdentifierFixture = 'service-id';
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultManagedMetadata(
        metadataKindFixture,
        serviceIdentifierFixture,
      );
    });

    it('should return ManagedClassElementMetadata', () => {
      const expected: ManagedClassElementMetadata = {
        kind: metadataKindFixture,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: serviceIdentifierFixture,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
