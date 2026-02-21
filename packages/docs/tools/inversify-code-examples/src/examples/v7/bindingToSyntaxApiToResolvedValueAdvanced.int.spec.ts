import { describe, expect, it } from 'vitest';

import {
  type Arsenal,
  arsenal,
  Katana,
} from './bindingToSyntaxApiToResolvedValueAdvanced.js';

describe('BindingToSyntax API (toResolvedValue, advanced)', () => {
  it('should provide a weapon with right damage', () => {
    const expectedArsenal: Arsenal = {
      weapons: [new Katana()],
    };

    expect(arsenal).toStrictEqual(expectedArsenal);
  });
});
