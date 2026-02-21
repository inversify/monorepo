import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

vitest.mock(import('../actions/getContainerModuleId.js'));

import { getContainerModuleId } from '../actions/getContainerModuleId.js';
import {
  ContainerModule,
  type ContainerModuleLoadOptions,
} from './ContainerModule.js';

describe(ContainerModule, () => {
  let containerModuleIdfixture: number;
  let asyncLoadMock: Mock<
    (options: ContainerModuleLoadOptions) => Promise<void>
  >;
  let syncLoadMock: Mock<(options: ContainerModuleLoadOptions) => void>;

  beforeAll(() => {
    containerModuleIdfixture = 1;
    asyncLoadMock = vitest.fn().mockResolvedValue(undefined);
    syncLoadMock = vitest.fn();

    vitest
      .mocked(getContainerModuleId)
      .mockReturnValue(containerModuleIdfixture);
  });

  describe('.id', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new ContainerModule(asyncLoadMock).id;
      });

      it('should return expected value', () => {
        expect(result).toBe(containerModuleIdfixture);
      });
    });
  });

  describe('.load', () => {
    describe('when called with async load function', () => {
      let optionsFixture: ContainerModuleLoadOptions;
      let result: unknown;

      beforeAll(async () => {
        optionsFixture = Symbol() as unknown as ContainerModuleLoadOptions;
        result = await new ContainerModule(asyncLoadMock).load(optionsFixture);
      });

      it('should call load()', () => {
        expect(asyncLoadMock).toHaveBeenCalledExactlyOnceWith(optionsFixture);
      });

      it('should return expected value', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with sync load function', () => {
      let optionsFixture: ContainerModuleLoadOptions;
      let result: unknown;

      beforeAll(() => {
        vitest.clearAllMocks();
        optionsFixture = Symbol() as unknown as ContainerModuleLoadOptions;
        result = new ContainerModule(syncLoadMock).load(optionsFixture);
      });

      it('should call load()', () => {
        expect(syncLoadMock).toHaveBeenCalledExactlyOnceWith(optionsFixture);
      });

      it('should return expected value', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
