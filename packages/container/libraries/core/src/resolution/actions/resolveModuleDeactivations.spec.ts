import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('./resolveBindingsDeactivations');

import { DeactivationParams } from '../models/DeactivationParams';
import { resolveBindingsDeactivations } from './resolveBindingsDeactivations';
import { resolveModuleDeactivations } from './resolveModuleDeactivations';

describe(resolveModuleDeactivations, () => {
  let paramsMock: Mocked<DeactivationParams>;
  let moduleIdFixture: number;

  beforeAll(() => {
    paramsMock = {
      getBindingsFromModule: vitest.fn() as unknown,
    } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
    moduleIdFixture = 2;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = resolveModuleDeactivations(paramsMock, moduleIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call params.getBindingsFromModule()', () => {
      expect(paramsMock.getBindingsFromModule).toHaveBeenCalledExactlyOnceWith(
        moduleIdFixture,
      );
    });

    it('should call resolveBindingsDeactivations()', () => {
      expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        undefined,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
