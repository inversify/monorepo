import { beforeAll, describe, expect, it } from 'vitest';

import { LazyServiceIdentifier } from '@inversifyjs/common';

import { type ResolvedValueInjectOptions } from '../models/ResolvedValueInjectOptions.js';
import { isResolvedValueMetadataInjectOptions } from './isResolvedValueMetadataInjectOptions.js';

describe(isResolvedValueMetadataInjectOptions, () => {
  describe.each<[string, ResolvedValueInjectOptions<unknown>, boolean]>([
    ['symbol serviceIdentifier', Symbol(), false],
    ['function serviceIdentifier', class {}, false],
    ['string serviceIdentifier', 'service-id', false],
    [
      'LazyServiceIdentifier',
      new LazyServiceIdentifier(() => 'service-id'),
      false,
    ],
    [
      'ResolvedValueMetadataInjectOptions',
      {
        serviceIdentifier: 'service-id',
      },
      true,
    ],
  ])(
    'having %s options',
    (
      _description: string,
      options: ResolvedValueInjectOptions<unknown>,
      expected: boolean,
    ) => {
      describe('when called', () => {
        let result: boolean;

        beforeAll(() => {
          result = isResolvedValueMetadataInjectOptions(options);
        });

        it(`should return ${String(expected)}`, () => {
          expect(result).toBe(expected);
        });
      });
    },
  );
});
