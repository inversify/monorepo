import { beforeAll, describe, expect, it } from 'vitest';

import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigSource } from '../models/ConfigSource.js';
import { object } from './object.js';

describe(object, () => {
  describe('when called', () => {
    let configFixture: ConfigObject;
    let result: ConfigSource;

    beforeAll(() => {
      configFixture = { port: 3000 };
      result = object(configFixture);
    });

    it('should return a ConfigSource that loads the object', () => {
      expect(result.load()).toBe(configFixture);
    });
  });
});
