import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type BindingDisposeMetadata } from '../models/BindingDisposeMetadata.js';
import { type SingletonScopedBinding } from '../models/SingletonScopedBinding.js';
import { getPluginDisposeBindingMap } from './getPluginDisposeBindingMap.js';

describe(getPluginDisposeBindingMap, () => {
  describe('when called, and the map is not defined', () => {
    let result: unknown;

    beforeAll(() => {
      result = getPluginDisposeBindingMap();
    });

    afterAll(() => {
      globalThis.__INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP = undefined;
    });

    it('should return a new map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });

  describe('when called, and the map is defined', () => {
    let mapFixture: Map<SingletonScopedBinding, BindingDisposeMetadata>;

    let result: unknown;

    beforeAll(() => {
      mapFixture = new Map();

      globalThis.__INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP = mapFixture;

      result = getPluginDisposeBindingMap();
    });

    afterAll(() => {
      globalThis.__INVERSIFY_PLUGIN_DISPOSE_BINDING_MAP = undefined;
    });

    it('should return the existing map', () => {
      expect(result).toStrictEqual(mapFixture);
    });
  });
});
