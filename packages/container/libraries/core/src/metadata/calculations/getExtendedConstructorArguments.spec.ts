import { beforeAll, describe, expect, it } from '@jest/globals';

import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { InjectFromOptions } from '../models/InjectFromOptions';
import { getExtendedConstructorArguments } from './getExtendedConstructorArguments';

describe(getExtendedConstructorArguments.name, () => {
  describe('having options with no extendConstructorArguments', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        type: class {},
      };

      baseTypeClassMetadataFixture = ClassMetadataFixtures.any;
      typeMetadataFixture = ClassMetadataFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getExtendedConstructorArguments(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata', () => {
        expect(result).toBe(typeMetadataFixture.constructorArguments);
      });
    });
  });

  describe('having options with extendConstructorArguments true', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        extendConstructorArguments: true,
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        constructorArguments: [
          {
            kind: ClassElementMetadataKind.unmanaged,
          },
          {
            kind: ClassElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            targetName: undefined,
            value: 'service-identifier-2',
          },
        ],
      };
      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        constructorArguments: [
          {
            kind: ClassElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            targetName: undefined,
            value: 'service-identifier-1',
          },
        ],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getExtendedConstructorArguments(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata', () => {
        expect(result).toStrictEqual([
          {
            kind: ClassElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            targetName: undefined,
            value: 'service-identifier-1',
          },
          {
            kind: ClassElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            targetName: undefined,
            value: 'service-identifier-2',
          },
        ]);
      });
    });
  });
});