import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { openApiValidationMetadataReflectKey } from '../models/openApiValidationMetadataReflectKey.js';
import { setValidateMetadata } from './setValidateMetadata.js';

describe(setValidateMetadata, () => {
  describe('when called as a parameter decorator', () => {
    let targetFixture: object;
    let keyFixture: string;
    let indexFixture: number;

    beforeAll(() => {
      targetFixture = { constructor: class {} };
      keyFixture = 'methodFixture';
      indexFixture = 0;

      setValidateMetadata(targetFixture, keyFixture, indexFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture.constructor,
        openApiValidationMetadataReflectKey,
        buildEmptyArrayMetadata,
        expect.any(Function),
        keyFixture,
      );
    });

    it('should provide a callback that sets the marker at the parameter index', () => {
      const calls: unknown[][] = vitest.mocked(updateOwnReflectMetadata).mock
        .calls;

      const firstCall: unknown[] | undefined = calls[0];

      expect(firstCall).toBeDefined();

      const callback: (metadata: boolean[]) => boolean[] = (
        firstCall as unknown[]
      )[3] as (metadata: boolean[]) => boolean[];

      const metadata: boolean[] = [];
      const result: boolean[] = callback(metadata);

      expect(result[indexFixture]).toBe(true);
    });
  });
});
