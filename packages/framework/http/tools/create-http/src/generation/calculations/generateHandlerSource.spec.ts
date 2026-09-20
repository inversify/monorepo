import { beforeAll, describe, expect, it } from 'vitest';

import { HandlerSourceFixtures } from '../fixtures/HandlerSourceFixtures.js';
import { generateHandlerSource } from './generateHandlerSource.js';

describe(generateHandlerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = HandlerSourceFixtures.any;
    });

    it('should generate a Handler interface with a handle method', () => {
      expect(result).toContain('export interface Handler<TInput, TOutput>');
      expect(result).toContain('handle(input: TInput): TOutput;');
    });
  });
});
