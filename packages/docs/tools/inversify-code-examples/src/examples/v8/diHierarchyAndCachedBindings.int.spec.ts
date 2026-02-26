import { describe, expect, it } from 'vitest';

import {
  LegendaryKatana,
  Samurai,
  samurai,
} from './diHierarchyAndCachedBindings.js';

describe('DI Hierarchy', () => {
  it('should provide a Katana', () => {
    expect(samurai).toBeInstanceOf(Samurai);
    expect(samurai.katana).toBeInstanceOf(LegendaryKatana);
    expect(samurai.katana.damage).toBe(100);
    expect((samurai.katana as LegendaryKatana).isLegendary).toBe(true);
  });
});
