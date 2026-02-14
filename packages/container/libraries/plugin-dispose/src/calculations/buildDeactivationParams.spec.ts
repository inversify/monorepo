import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/core'));

import {
  BindingService,
  DeactivationParams,
  DeactivationsService,
  getClassMetadata,
} from '@inversifyjs/core';
import { PluginContext } from '@inversifyjs/plugin';

import { buildDeactivationParams } from './buildDeactivationParams';

describe(buildDeactivationParams, () => {
  let pluginContextMock: PluginContext;

  beforeAll(() => {
    pluginContextMock = {
      bindingService: {
        get: vitest.fn(),
        getByModuleId: vitest.fn(),
      } as Partial<Mocked<BindingService>> as Mocked<BindingService>,
      deactivationService: {
        get: vitest.fn(),
      } as Partial<
        Mocked<DeactivationsService>
      > as Mocked<DeactivationsService>,
    } as Partial<Mocked<PluginContext>> as Mocked<PluginContext>;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDeactivationParams(pluginContextMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return the expected result', () => {
      const expected: DeactivationParams = {
        getBindings: expect.any(Function) as unknown,
        getBindingsFromModule: expect.any(Function) as unknown,
        getClassMetadata: vitest.mocked(getClassMetadata),
        getDeactivations: expect.any(Function) as unknown,
      } as Partial<DeactivationParams> as DeactivationParams;

      expect(result).toStrictEqual(expected);
    });
  });
});
