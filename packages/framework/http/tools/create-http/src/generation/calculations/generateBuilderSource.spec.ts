import { beforeAll, describe, expect, it } from 'vitest';

import { BuilderSourceFixtures } from '../fixtures/BuilderSourceFixtures.js';
import { generateBuilderSource } from './generateBuilderSource.js';

describe(generateBuilderSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = BuilderSourceFixtures.any;
    });

    it('should generate a Builder interface with a build method', () => {
      expect(result).toContain('export interface Builder<TInput, TOutput>');
      expect(result).toContain('build(input: TInput): TOutput;');
    });
  });
});
