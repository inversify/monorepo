import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';

import { BindingDeactivation } from '../../binding/models/BindingDeactivation';
import { DeactivationParams } from '../models/DeactivationParams';
import { resolveBindingServiceDeactivations } from './resolveBindingServiceDeactivations';

describe(resolveBindingServiceDeactivations, () => {
  describe('having a non promise value', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let serviceIdentifierFixture: ServiceIdentifier;
    let valueFixture: unknown;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
        getDeactivations: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      serviceIdentifierFixture = 'service-id';
      valueFixture = Symbol();
    });

    describe('when called, and params.getActivations() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingServiceDeactivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getDeactivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and params.getActivations() returns sync activations', () => {
      let deactivationMock: Mock<BindingDeactivation>;

      let result: unknown;

      beforeAll(() => {
        deactivationMock = vitest.fn();
        deactivationMock.mockReturnValueOnce(undefined);

        paramsMock.getDeactivations.mockReturnValueOnce([deactivationMock]);

        result = resolveBindingServiceDeactivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getDeactivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(deactivationMock).toHaveBeenCalledExactlyOnceWith(valueFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and params.getActivations() returns async activations', () => {
      let deactivationMock: Mock<BindingDeactivation>;

      let result: unknown;

      beforeAll(async () => {
        deactivationMock = vitest.fn();
        deactivationMock.mockResolvedValueOnce(undefined);

        paramsMock.getDeactivations.mockReturnValueOnce([deactivationMock]);

        result = await resolveBindingServiceDeactivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getDeactivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(deactivationMock).toHaveBeenCalledExactlyOnceWith(valueFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a promise value', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let serviceIdentifierFixture: ServiceIdentifier;
    let valueFixture: unknown;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
        getDeactivations: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      serviceIdentifierFixture = 'service-id';
      valueFixture = Symbol();
    });

    describe('when called, and params.getActivations() returns undefined', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await resolveBindingServiceDeactivations(
          paramsMock,
          serviceIdentifierFixture,
          Promise.resolve(valueFixture),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getDeactivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and params.getActivations() returns sync activations', () => {
      let deactivationMock: Mock<BindingDeactivation>;

      let result: unknown;

      beforeAll(async () => {
        deactivationMock = vitest.fn();
        deactivationMock.mockReturnValueOnce(undefined);

        paramsMock.getDeactivations.mockReturnValueOnce([deactivationMock]);

        result = await resolveBindingServiceDeactivations(
          paramsMock,
          serviceIdentifierFixture,
          Promise.resolve(valueFixture),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getDeactivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(deactivationMock).toHaveBeenCalledExactlyOnceWith(valueFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and params.getActivations() returns async activations', () => {
      let deactivationMock: Mock<BindingDeactivation>;

      let result: unknown;

      beforeAll(async () => {
        deactivationMock = vitest.fn();
        deactivationMock.mockResolvedValueOnce(undefined);

        paramsMock.getDeactivations.mockReturnValueOnce([deactivationMock]);

        result = await resolveBindingServiceDeactivations(
          paramsMock,
          serviceIdentifierFixture,
          Promise.resolve(valueFixture),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getDeactivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(deactivationMock).toHaveBeenCalledExactlyOnceWith(valueFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
