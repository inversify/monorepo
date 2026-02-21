import { describe, expect, it } from 'vitest';

import { warrior } from './decorateParameterDecorator.js';

describe('decorate API (ParameterDecorator)', () => {
  it('should apply inject decorator to constructor parameter', () => {
    expect(warrior.fight()).toBe('Fighting with weapon damage: 10');
  });
});
