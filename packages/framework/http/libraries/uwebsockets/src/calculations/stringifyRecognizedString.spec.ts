import { beforeAll, describe, expect, it } from 'vitest';

import { type RecognizedString } from 'uWebSockets.js';

import { stringifyRecognizedString } from './stringifyRecognizedString.js';

describe(stringifyRecognizedString, () => {
  describe('having a string value', () => {
    let valueFixture: RecognizedString;

    beforeAll(() => {
      valueFixture = 'content-type';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyRecognizedString(valueFixture);
      });

      it('should return the same string', () => {
        expect(result).toBe('content-type');
      });
    });
  });

  describe('having an ArrayBuffer value', () => {
    let valueFixture: RecognizedString;

    beforeAll(() => {
      const buffer: Buffer = Buffer.from('content-type');

      valueFixture = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyRecognizedString(valueFixture);
      });

      it('should return the decoded string', () => {
        expect(result).toBe('content-type');
      });
    });
  });

  describe('having an ArrayBufferView value', () => {
    let valueFixture: RecognizedString;

    beforeAll(() => {
      valueFixture = new Uint8Array(Buffer.from('content-type'));
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyRecognizedString(valueFixture);
      });

      it('should return the decoded string', () => {
        expect(result).toBe('content-type');
      });
    });
  });
});
