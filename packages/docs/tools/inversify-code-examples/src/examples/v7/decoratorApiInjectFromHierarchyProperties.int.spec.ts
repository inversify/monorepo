import { describe, expect, it } from 'vitest';

import { soldier } from './decoratorApiInjectFromHierarchyProperties.js';

describe('Decorator API (injectFromHierarchy)', () => {
  it('should provide a soldier with a weapon from base property', () => {
    expect(soldier.weapon).toBe('sword');
  });
});
