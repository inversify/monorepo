import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { Container } from '@inversifyjs/container';
import { PluginApi, PluginContext } from '@inversifyjs/plugin';

import { PluginDispose } from './PluginDispose';

describe(PluginDispose, () => {
  let containerMock: Mocked<Container>;
  let contextMock: Mocked<PluginContext>;

  let pluginDispose: PluginDispose;

  beforeAll(() => {
    containerMock = {} as Partial<Mocked<Container>> as Mocked<Container>;
    contextMock = {} as Partial<Mocked<PluginContext>> as Mocked<PluginContext>;

    pluginDispose = new PluginDispose(containerMock, contextMock);
  });

  describe('.load', () => {
    describe('when called', () => {
      let pluginApiMock: Mocked<PluginApi>;

      let result: unknown;

      beforeAll(() => {
        pluginApiMock = {
          define: vitest.fn(),
          onPlan: vitest.fn(),
        };

        result = pluginDispose.load(pluginApiMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should define the dispose methods', () => {
        expect(pluginApiMock.define).toHaveBeenCalledTimes(2);
        expect(pluginApiMock.define).toHaveBeenNthCalledWith(
          1,
          Symbol.asyncDispose,
          expect.any(Function),
        );
        expect(pluginApiMock.define).toHaveBeenNthCalledWith(
          2,
          Symbol.dispose,
          expect.any(Function),
        );
      });

      it('should register the singleton scoped bindings', () => {
        expect(pluginApiMock.onPlan).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
