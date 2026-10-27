import { beforeAll, describe, expect, it } from 'vitest';

import { readCallStage } from './readCallStage.js';

describe(readCallStage, () => {
  describe('having no stage parameter', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readCallStage(new URLSearchParams('section=guards'));
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });

  describe('having a stage parameter', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readCallStage(
          new URLSearchParams('section=guards&stage=guard-guard-1'),
        );
      });

      it('should return that stage', () => {
        expect(result).toBe('guard-guard-1');
      });
    });
  });
});
