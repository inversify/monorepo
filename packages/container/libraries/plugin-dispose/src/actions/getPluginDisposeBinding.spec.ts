import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { bindingScopeValues, bindingTypeValues } from '@inversifyjs/core';

vitest.mock('./getPluginDisposeBindingMap');

import { BindingDisposeMetadata } from '../models/BindingDisposeMetadata';
import { SingletonScopedBinding } from '../models/SingletonScopedBinding';
import { getPluginDisposeBinding } from './getPluginDisposeBinding';
import { getPluginDisposeBindingMap } from './getPluginDisposeBindingMap';

describe(getPluginDisposeBinding, () => {
  let bindingFixture: SingletonScopedBinding;

  beforeAll(() => {
    bindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 0,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.ConstantValue,
      value: Symbol(),
    };
  });

  describe('when called', () => {
    let bindingDisposeMetadataFixure: BindingDisposeMetadata;
    let mapMock: Mocked<Map<SingletonScopedBinding, BindingDisposeMetadata>>;

    let result: unknown;

    beforeAll(() => {
      bindingDisposeMetadataFixure = {
        dependendentBindings: new Set(),
      };

      mapMock = {
        get: vitest.fn().mockReturnValueOnce(bindingDisposeMetadataFixure),
      } as Partial<
        Map<SingletonScopedBinding, BindingDisposeMetadata>
      > as Mocked<Map<SingletonScopedBinding, BindingDisposeMetadata>>;

      vitest.mocked(getPluginDisposeBindingMap).mockReturnValueOnce(mapMock);

      result = getPluginDisposeBinding(bindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getPluginDisposeBindingMap', () => {
      expect(getPluginDisposeBindingMap).toHaveBeenCalledExactlyOnceWith();
    });

    it('should call map.get with the binding', () => {
      expect(mapMock.get).toHaveBeenCalledExactlyOnceWith(bindingFixture);
    });

    it('should return BindingDisposeMetadata', () => {
      expect(result).toBe(bindingDisposeMetadataFixure);
    });
  });
});
