import { describe, expect, it } from 'vitest';

import { container, Ninja } from './bindingToSyntaxApiToAutoFactory';

describe('BindingToSyntax API (toAutoFactory)', () => {
  it('should provide ninja', () => {
    const ninja: Ninja = container.get(Ninja);

    expect(ninja.fight()).toBe('hit!');
    expect(ninja.sneak()).toBe('throw!');
  });
});
