import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { inject } from './inject';
import { injectFromHierarchy } from './injectFromHierarchy';

describe(injectFromHierarchy, () => {
  describe('having a base class with constructor arguments', () => {
    abstract class BaseSoldier {
      constructor(@inject('Weapon') _weapon: unknown) {}
    }

    abstract class IntermediateSoldier extends BaseSoldier {}

    @injectFromHierarchy({
      extendConstructorArguments: true,
      extendProperties: false,
    })
    class Soldier extends IntermediateSoldier {}

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getOwnReflectMetadata(Soldier, classMetadataReflectKey);
      });

      it('should merge base constructor metadata without error (and not include Object)', () => {
        const expected: ClassMetadata = {
          constructorArguments: [
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'Weapon',
            },
          ],
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set(),
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a base class with properties', () => {
    abstract class BaseSoldier {
      @inject('Shield')
      public shield!: unknown;
    }

    abstract class IntermediateSoldier extends BaseSoldier {}

    @injectFromHierarchy({
      extendConstructorArguments: false,
      extendProperties: true,
    })
    class Soldier extends IntermediateSoldier {}

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getOwnReflectMetadata(Soldier, classMetadataReflectKey);
      });

      it('should merge base property metadata without error (and not include Object)', () => {
        const expected: ClassMetadata = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set(),
          },
          properties: new Map([
            [
              'shield',
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'Shield',
              },
            ],
          ]),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
