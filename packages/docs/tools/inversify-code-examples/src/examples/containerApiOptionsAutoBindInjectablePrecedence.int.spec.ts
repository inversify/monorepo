import { describe, expect, it } from 'vitest';

import {
  container,
  Ninja,
  NinjaMaster,
} from './containerApiOptionsAutoBindInjectablePrecedence';

describe('Container API options (autoBindInjectable, precedence)', () => {
  it('should provide ninja according to manual binding', () => {
    expect(container.get(Ninja)).toBeInstanceOf(NinjaMaster);
  });
});
