import { describe, expect, it } from 'vitest';

import { ninja } from './decoratorApiNamed.js';

describe('Decorator API (named)', () => {
  it('should provide a ninja with right weapons', () => {
    expect(ninja.katana.damage).toBe(10);
    expect(ninja.shuriken.damage).toBe(5);
  });
});
