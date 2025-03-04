import { beforeAll, describe, expect, it, Mock, vitest } from 'vitest';

vitest.mock('../actions/getContainerModuleId');

import { getContainerModuleId } from '../actions/getContainerModuleId';
import { ContainerModule, ContainerModuleLoadOptions } from './ContainerModule';

describe(ContainerModule.name, () => {
  let containerModuleIdfixture: number;
  let loadMock: Mock<(options: ContainerModuleLoadOptions) => Promise<void>>;

  beforeAll(() => {
    containerModuleIdfixture = 1;
    loadMock = vitest.fn();

    vitest
      .mocked(getContainerModuleId)
      .mockReturnValue(containerModuleIdfixture);
  });

  describe('.id', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new ContainerModule(loadMock).id;
      });

      it('should return expected value', () => {
        expect(result).toBe(containerModuleIdfixture);
      });
    });
  });

  describe('.load', () => {
    describe('when called', () => {
      let optionsFixture: ContainerModuleLoadOptions;

      let result: unknown;

      beforeAll(async () => {
        optionsFixture = Symbol() as unknown as ContainerModuleLoadOptions;

        result = await new ContainerModule(loadMock).load(optionsFixture);
      });

      it('should call load()', () => {
        expect(loadMock).toHaveBeenCalledTimes(1);
        expect(loadMock).toHaveBeenCalledWith(optionsFixture);
      });

      it('should return expected value', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
