import { describe, expect, it } from 'vitest';

import { katanaDamageSpy } from './decoratorApiPreDestroy.js';

describe('Decorator API (preDestroy)', () => {
  it('should provide activated service', () => {
    expect(katanaDamageSpy).toHaveBeenCalledExactlyOnceWith();
  });
});
