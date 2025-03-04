import { describe, expect, it } from 'vitest';

import { ninjaDamage } from './bindingWhenSyntaxApiWhen';

describe('BindingWhenSyntax API (when)', () => {
  it('should bind right ninja weapon', () => {
    expect(ninjaDamage).toBe(5);
  });
});
