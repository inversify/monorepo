import { describe, expect, it } from 'vitest';

import {
  isKatanaBound,
  isKatanaSymbolBound,
  isNinjaBound,
  isWarriorSymbolBound,
} from './containerApiIsBound.js';

describe('Container API (isBound)', () => {
  it('should detect bound and not bound services', async () => {
    expect(isKatanaBound).toBe(false);
    expect(isKatanaSymbolBound).toBe(false);
    expect(isNinjaBound).toBe(true);
    expect(isWarriorSymbolBound).toBe(true);
  });
});
