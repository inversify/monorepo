import { describe, expect, it } from 'vitest';

import {
  isDivisorBoundInIsValidDivisorFalseTag,
  isDivisorBoundInIsValidDivisorTrueTag,
} from './containerApiIsBoundTagged.js';

describe('Container API (isCurrentBoundTagged)', () => {
  it('should detect bound and not bound services', async () => {
    expect(isDivisorBoundInIsValidDivisorFalseTag).toBe(true);
    expect(isDivisorBoundInIsValidDivisorTrueTag).toBe(true);
  });
});
