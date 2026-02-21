import { describe, expect, it } from 'vitest';

import {
  Katana,
  katanaConstructor,
} from './bindingToSyntaxApiToConstructor.js';

describe('BindingToSyntax API (toConstructor)', () => {
  it('should bind Katana weapon constructor', () => {
    expect(katanaConstructor).toBe(Katana);
  });
});
