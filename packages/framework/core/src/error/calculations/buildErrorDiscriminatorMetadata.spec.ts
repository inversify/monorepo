import { beforeAll, describe, expect, it } from 'vitest';

import { buildErrorDiscriminatorMetadata } from './buildErrorDiscriminatorMetadata.js';

describe(buildErrorDiscriminatorMetadata, () => {
  describe('when called and discriminator is not present', () => {
    let discriminatorFixture: string;
    let discriminatorsFixture: (string | symbol)[];
    let result: (string | symbol)[];

    beforeAll(() => {
      discriminatorFixture = 'child-error';
      discriminatorsFixture = ['parent-error'];
      result = buildErrorDiscriminatorMetadata(discriminatorFixture)(
        discriminatorsFixture,
      );
    });

    it('should unshift discriminator to the front', () => {
      expect(result).toStrictEqual(['child-error', 'parent-error']);
    });
  });

  describe('when called and discriminator is already present', () => {
    let discriminatorFixture: string;
    let discriminatorsFixture: (string | symbol)[];
    let result: (string | symbol)[];

    beforeAll(() => {
      discriminatorFixture = 'existing-error';
      discriminatorsFixture = ['existing-error'];
      result = buildErrorDiscriminatorMetadata(discriminatorFixture)(
        discriminatorsFixture,
      );
    });

    it('should not duplicate the discriminator', () => {
      expect(result).toStrictEqual(['existing-error']);
    });
  });
});
