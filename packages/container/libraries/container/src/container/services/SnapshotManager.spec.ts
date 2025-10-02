import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import {
  ActivationsService,
  BindingService,
  DeactivationsService,
  PlanResultCacheService,
} from '@inversifyjs/core';

import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { ServiceReferenceManager } from './ServiceReferenceManager';
import { SnapshotManager } from './SnapshotManager';

describe(SnapshotManager, () => {
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;

  beforeAll(() => {
    serviceReferenceManagerMock = {
      activationService: {
        clone: vitest.fn(),
      } as Partial<Mocked<ActivationsService>> as Mocked<ActivationsService>,
      bindingService: {
        clone: vitest.fn(),
      } as Partial<Mocked<BindingService>> as Mocked<BindingService>,
      deactivationService: {
        clone: vitest.fn(),
      } as Partial<
        Mocked<DeactivationsService>
      > as Mocked<DeactivationsService>,
      planResultCacheService: {} as Partial<
        Mocked<PlanResultCacheService>
      > as Mocked<PlanResultCacheService>,
      reset: vitest.fn(),
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
  });

  describe('.restore', () => {
    describe('having a snapshot manager with no snapshots', () => {
      let snapshotManager: SnapshotManager;

      beforeAll(() => {
        snapshotManager = new SnapshotManager(serviceReferenceManagerMock);
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            snapshotManager.restore();
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message: 'No snapshot available to restore',
          };

          expect(result).toBeInstanceOf(InversifyContainerError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a snapshot manager with a snapshot', () => {
      let snapshotManager: SnapshotManager;

      beforeAll(() => {
        snapshotManager = new SnapshotManager(serviceReferenceManagerMock);
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          snapshotManager.snapshot();

          result = snapshotManager.restore();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.snapshot', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new SnapshotManager(serviceReferenceManagerMock).snapshot();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationService.clone()', () => {
        expect(
          serviceReferenceManagerMock.activationService.clone,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call bindingService.clone()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.clone,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call deactivationService.clone()', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.clone,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
