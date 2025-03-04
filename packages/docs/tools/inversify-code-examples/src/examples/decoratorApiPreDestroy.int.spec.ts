import { describe, expect, it } from 'vitest';

import { katanaDamageSpy } from './decoratorApiPreDestroy';

describe('Decorator API (preDestroy)', () => {
  it('should provide activated service', () => {
    expect(katanaDamageSpy).toHaveBeenCalledTimes(1);
    expect(katanaDamageSpy).toHaveBeenCalledWith();
  });
});
