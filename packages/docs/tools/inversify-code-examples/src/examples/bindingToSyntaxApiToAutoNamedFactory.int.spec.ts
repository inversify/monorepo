import { describe, expect, it } from 'vitest';

import { container, Ninja } from './bindingToSyntaxApiToAutoNamedFactory';

describe('BindingToSyntax API (toAutoNamedFactory)', () => {
  it('should provide ninja', () => {
    const ninja: Ninja = container.get(Ninja);

    expect(ninja.fight()).toBe('hit!');
    expect(ninja.sneak()).toBe('throw!');
  });
});
