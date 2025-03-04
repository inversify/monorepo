import { describe, expect, it } from 'vitest';

import {
  isDivisorBoundInInvalidDivisorName,
  isDivisorBoundInValidDivisorName,
} from './containerApiIsBoundNamed';

describe('Container API (isCurrentBoundNamed)', () => {
  it('should detect bound and not bound services', async () => {
    expect(isDivisorBoundInInvalidDivisorName).toBe(true);
    expect(isDivisorBoundInValidDivisorName).toBe(true);
  });
});
