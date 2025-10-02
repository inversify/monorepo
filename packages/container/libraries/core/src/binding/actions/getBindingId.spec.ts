import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getOwnReflectMetadata,
  setReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { getBindingId } from './getBindingId';

describe(getBindingId, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(0);

      result = getBindingId();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Object,
        '@inversifyjs/container/bindingId',
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Object,
        '@inversifyjs/container/bindingId',
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should return default id', () => {
      expect(result).toBe(0);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns Number.MAX_SAFE_INTEGER', () => {
    let result: unknown;

    beforeAll(() => {
      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(Number.MAX_SAFE_INTEGER);

      result = getBindingId();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Object,
        '@inversifyjs/container/bindingId',
      );
    });

    it('should call setReflectMetadata()', () => {
      expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Object,
        '@inversifyjs/container/bindingId',
        Number.MIN_SAFE_INTEGER,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
