import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigSource } from '../models/ConfigSource.js';
import { factory } from './factory.js';

describe(factory, () => {
  describe('when called', () => {
    let configFixture: ConfigObject;
    let loadMock: () => ConfigObject;
    let result: ConfigSource;

    beforeAll(() => {
      configFixture = { port: 3000 };
      loadMock = vitest.fn().mockReturnValue(configFixture);
      result = factory(loadMock);
    });

    it('should return a ConfigSource that delegates to the factory', () => {
      expect(result.load()).toBe(configFixture);
      expect(loadMock).toHaveBeenCalledExactlyOnceWith();
    });
  });
});
