import { describe, expect, it } from 'vitest';

import { warrior } from './decoratePropertyDecorator';

describe('decorate API (PropertyDecorator)', () => {
  it('should apply inject decorator to property', () => {
    expect(warrior.fight()).toBe('Fighting with weapon damage: 10');
  });
});
