import { beforeAll, describe, expect, it } from 'vitest';

import { toArrayBuffer } from './toArrayBuffer';

describe(toArrayBuffer, () => {
  describe('having an empty Buffer', () => {
    let bufferFixture: Buffer;

    beforeAll(() => {
      bufferFixture = Buffer.from([]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(bufferFixture);
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(ArrayBuffer);
        expect((result as ArrayBuffer).byteLength).toBe(0);
      });
    });
  });

  describe('having a Buffer backed by an ArrayBuffer', () => {
    let bufferFixture: Buffer;

    beforeAll(() => {
      bufferFixture = Buffer.from([1, 2, 3, 4, 5]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(bufferFixture);
      });

      it('should return expected result', () => {
        const resultArray: Uint8Array = new Uint8Array(result as ArrayBuffer);
        const bufferArray: Uint8Array = new Uint8Array(bufferFixture);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(resultArray).toStrictEqual(bufferArray);
      });
    });
  });

  describe('having a Buffer with non-zero byteOffset', () => {
    let bufferFixture: Buffer;
    let originalData: Uint8Array;

    beforeAll(() => {
      const largeBuffer: Buffer = Buffer.from([0, 0, 1, 2, 3, 4, 5, 0, 0]);
      bufferFixture = largeBuffer.subarray(2, 7); // [1, 2, 3, 4, 5]
      originalData = new Uint8Array(bufferFixture);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(bufferFixture);
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(ArrayBuffer);

        const resultArray: Uint8Array = new Uint8Array(result as ArrayBuffer);

        expect(resultArray).toStrictEqual(originalData);
        expect(resultArray).toHaveLength(5);
      });
    });
  });

  describe('having a Buffer backed by a SharedArrayBuffer', () => {
    let bufferFixture: Buffer;
    let sharedArrayBuffer: SharedArrayBuffer;

    beforeAll(() => {
      sharedArrayBuffer = new SharedArrayBuffer(5);

      const sharedArray: Uint8Array = new Uint8Array(sharedArrayBuffer);
      sharedArray.set([10, 20, 30, 40, 50]);

      bufferFixture = Buffer.from(sharedArrayBuffer);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(bufferFixture);
      });

      it('should return expected result', () => {
        const resultArray: Uint8Array = new Uint8Array(result as ArrayBuffer);
        const bufferArray: Uint8Array = new Uint8Array(bufferFixture);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(resultArray).toStrictEqual(bufferArray);
      });

      it('should return a new ArrayBuffer (not a reference)', () => {
        expect(result).not.toBe(sharedArrayBuffer);
        expect(result).not.toBe(bufferFixture.buffer);
      });
    });
  });

  describe('having an empty string', () => {
    let stringFixture: string;

    beforeAll(() => {
      stringFixture = '';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(stringFixture);
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(ArrayBuffer);
        expect((result as ArrayBuffer).byteLength).toBe(0);
      });
    });
  });

  describe('having a string chunk', () => {
    let stringFixture: string;

    beforeAll(() => {
      stringFixture = 'Hello, World!';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(stringFixture);
      });

      it('should return expected result', () => {
        const resultArray: Uint8Array = new Uint8Array(result as ArrayBuffer);
        const expectedArray: Uint8Array = new Uint8Array(
          Buffer.from(stringFixture),
        );

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(resultArray).toStrictEqual(expectedArray);
      });

      it('should not return a SharedArrayBuffer', () => {
        expect(result).not.toBeInstanceOf(SharedArrayBuffer);
      });
    });
  });

  describe('having a string with multi-byte UTF-8 characters', () => {
    let stringFixture: string;

    beforeAll(() => {
      stringFixture = '你好 🌍 café';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toArrayBuffer(stringFixture);
      });

      it('should return expected result', () => {
        const resultArray: Uint8Array = new Uint8Array(result as ArrayBuffer);
        const expectedArray: Uint8Array = new Uint8Array(
          Buffer.from(stringFixture),
        );

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(resultArray).toStrictEqual(expectedArray);
      });

      it('should decode back to the original string', () => {
        const decoded: string = Buffer.from(result as ArrayBuffer).toString(
          'utf-8',
        );

        expect(decoded).toBe(stringFixture);
      });
    });
  });
});
