import { describe, expect, it } from 'vitest';

import { ninja } from './decoratorApiTagged.js';

describe('Decorator API (tagged)', () => {
  it('should provide a ninja with right weapons', () => {
    expect(ninja.katana.damage).toBe(10);
    expect(ninja.shuriken.damage).toBe(5);
  });
});
