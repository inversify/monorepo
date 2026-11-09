import { describe, expect, it } from 'vitest';

import { weaponArgument } from './containerApiInspectCurrentPlan.js';

describe('Container API (inspectCurrentPlan)', () => {
  it('should expose the named constructor dependency', () => {
    expect(weaponArgument?.serviceIdentifier).toBe('Weapon');
    expect(weaponArgument?.name).toBe('melee');
    expect(weaponArgument?.isMultiple).toBe(false);
  });
});
