import { beforeAll, describe, expect, it } from 'vitest';

import { type Newable } from '@inversifyjs/common';

import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { buildClassElementMetadataFromTypescriptParameterType } from './buildClassElementMetadataFromTypescriptParameterType.js';

describe(buildClassElementMetadataFromTypescriptParameterType, () => {
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
