import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import {
  type ActivationsService,
  type BindingService,
  type DeactivationsService,
  type PlanResultCacheService,
} from '@inversifyjs/core';

import { InversifyContainerError } from '../../error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';
import { SnapshotManager } from './SnapshotManager.js';

describe(SnapshotManager, () => {
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;

  beforeAll(() => {
    serviceReferenceManagerMock = {
      activationService: {
        clone: vitest.fn(),
      } as Partial<ActivationsService> as ActivationsService,
      bindingService: {
        clone: vitest.fn(),
      } as Partial<BindingService> as BindingService,
      deactivationService: {
        clone: vitest.fn(),
      } as Partial<DeactivationsService> as DeactivationsService,
      planResultCacheService: {} as PlanResultCacheService,
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
