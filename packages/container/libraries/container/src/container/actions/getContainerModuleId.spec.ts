import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getOwnReflectMetadata,
  setReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { getContainerModuleId } from './getContainerModuleId';

describe(getContainerModuleId.name, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(0);

      result = getContainerModuleId();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        Object,
        '@inversifyjs/container/bindingId',
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
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

      result = getContainerModuleId();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        Object,
        '@inversifyjs/container/bindingId',
      );
    });

    it('should call setReflectMetadata()', () => {
      expect(setReflectMetadata).toHaveBeenCalledTimes(1);
      expect(setReflectMetadata).toHaveBeenCalledWith(
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
