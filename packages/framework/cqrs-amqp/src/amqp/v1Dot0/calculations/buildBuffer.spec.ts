import { beforeAll, describe, expect, it } from 'vitest';

import { buildBuffer } from './buildBuffer.js';

describe(buildBuffer, () => {
  describe('having a Buffer', () => {
    let bytesFixture: Buffer;

    beforeAll(() => {
      bytesFixture = Buffer.from([1, 2]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuffer(bytesFixture);
      });

      it('should return the same Buffer', () => {
        expect(result).toBe(bytesFixture);
      });
    });
  });

  describe('having a Uint8Array view', () => {
    let bytesFixture: Uint8Array;

    beforeAll(() => {
      bytesFixture = new Uint8Array([0, 1, 2, 3]).subarray(1, 3);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuffer(bytesFixture);
      });

      it('should return a Buffer over the same bytes', () => {
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result).toStrictEqual(Buffer.from([1, 2]));
      });
    });
  });
});
