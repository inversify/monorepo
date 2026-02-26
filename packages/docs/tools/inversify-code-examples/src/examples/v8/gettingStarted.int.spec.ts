import { describe, expect, it } from 'vitest';

import { ninja } from './gettingStarted.js';

describe('getting started', () => {
  it('should provide a ninja with a weapon with right damage', () => {
    expect(ninja.katana.damage).toBe(10);
  });
});
