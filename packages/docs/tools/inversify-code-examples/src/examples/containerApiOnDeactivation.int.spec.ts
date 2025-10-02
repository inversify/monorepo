import { describe, expect, it } from 'vitest';

import { katanaDamageSpy } from './containerApiOnDeactivation';

describe('Container API (onDeactivation)', () => {
  it('should provide activated service', () => {
    expect(katanaDamageSpy).toHaveBeenCalledExactlyOnceWith();
  });
});
