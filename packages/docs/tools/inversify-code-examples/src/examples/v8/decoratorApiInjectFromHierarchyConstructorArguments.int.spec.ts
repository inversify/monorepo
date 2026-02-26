import { describe, expect, it } from 'vitest';

import { soldier } from './decoratorApiInjectFromHierarchyConstructorArguments.js';

describe('Decorator API (injectFromHierarchy)', () => {
  it('should provide a soldier with a weapon from base constructor', () => {
    expect(soldier.weapon).toBe('sword');
  });
});
