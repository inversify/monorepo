import { beforeAll, describe, expect, it } from 'vitest';

import { Newable } from '@inversifyjs/common';

import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { buildClassElementMetadataFromTypescriptParameterType } from './buildClassElementMetadataFromTypescriptParameterType';

describe(buildClassElementMetadataFromTypescriptParameterType.name, () => {
  describe('when called', () => {
    let typeFixture: Newable;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class {};

      result =
        buildClassElementMetadataFromTypescriptParameterType(typeFixture);
    });

    it('should return ClassElementMetadata', () => {
      const expected: ClassElementMetadata = {
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: typeFixture,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
