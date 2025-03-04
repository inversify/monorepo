import { describe, expect, it } from 'vitest';

import {
  container,
  Ninja,
  warriorServiceId,
} from './containerApiOptionsDefaultScope';

describe('Container API options (defaultScope)', () => {
  it('should provide a container with ninja binding in transient scope', () => {
    expect(container.get(warriorServiceId)).toBeInstanceOf(Ninja);
    expect(container.get(warriorServiceId)).not.toBe(
      container.get(warriorServiceId),
    );
  });
});
