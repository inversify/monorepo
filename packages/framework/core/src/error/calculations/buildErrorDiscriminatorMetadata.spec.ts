import { beforeAll, describe, expect, it } from 'vitest';

import { buildErrorDiscriminatorMetadata } from './buildErrorDiscriminatorMetadata.js';

describe(buildErrorDiscriminatorMetadata, () => {
  describe('having a discriminator not present in the metadata', () => {
    let discriminatorFixture: string;
    let discriminatorsFixture: (string | symbol)[];
    let result: (string | symbol)[];

    describe('when called', () => {
      beforeAll(() => {
        discriminatorFixture = 'child-error';
        discriminatorsFixture = ['sibling-error'];
        result = buildErrorDiscriminatorMetadata(discriminatorFixture)(
          discriminatorsFixture,
        );
      });

      it('should return the discriminator before existing own metadata', () => {
        expect(result).toStrictEqual(['child-error', 'sibling-error']);
      });

      it('should not mutate existing own metadata', () => {
        expect(discriminatorsFixture).toStrictEqual(['sibling-error']);
        expect(result).not.toBe(discriminatorsFixture);
      });
    });
  });

  describe('having a discriminator already present in the metadata', () => {
    let discriminatorFixture: string;
    let discriminatorsFixture: (string | symbol)[];
    let result: (string | symbol)[];

    describe('when called', () => {
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

      it('should return a new metadata array', () => {
        expect(result).not.toBe(discriminatorsFixture);
      });
    });
  });
});
