import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';

vitest.mock('./resolveBindingsDeactivations');

import { DeactivationParams } from '../models/DeactivationParams';
import { resolveBindingsDeactivations } from './resolveBindingsDeactivations';
import { resolveServiceDeactivations } from './resolveServiceDeactivations';

describe(resolveServiceDeactivations, () => {
  let paramsMock: Mocked<DeactivationParams>;
  let serviceIdentifierFixture: ServiceIdentifier;

  beforeAll(() => {
    paramsMock = {
      getBindings: vitest.fn() as unknown,
    } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
    serviceIdentifierFixture = 'service-id';
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = resolveServiceDeactivations(
        paramsMock,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call params.getBindings()', () => {
      expect(paramsMock.getBindings).toHaveBeenCalledExactlyOnceWith(
        serviceIdentifierFixture,
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
