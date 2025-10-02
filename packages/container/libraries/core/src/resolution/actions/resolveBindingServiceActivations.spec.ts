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

import { BindingActivation } from '../../binding/models/BindingActivation';
import { ResolutionContext } from '../models/ResolutionContext';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveBindingServiceActivations } from './resolveBindingServiceActivations';

describe(resolveBindingServiceActivations, () => {
  describe('having a non promise value', () => {
    let paramsMock: Mocked<ResolutionParams>;
    let serviceIdentifierFixture: ServiceIdentifier;
    let valueFixture: unknown;

    beforeAll(() => {
      paramsMock = {
        context: Symbol() as unknown as Mocked<ResolutionContext>,
        getActivations: vitest.fn(),
      } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
      serviceIdentifierFixture = 'service-id';
      valueFixture = Symbol();
    });

    describe('when called, and params.getActivations() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getActivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should return value', () => {
        expect(result).toBe(valueFixture);
      });
    });

    describe('when called, and params.getActivations() returns sync activations', () => {
      let activationMock: Mock<BindingActivation>;
      let activationResult: unknown;

      let result: unknown;

      beforeAll(() => {
        activationResult = Symbol('activation-result');

        activationMock = vitest.fn().mockReturnValueOnce(activationResult);

        paramsMock.getActivations.mockReturnValueOnce([activationMock]);

        result = resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getActivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(activationMock).toHaveBeenCalledExactlyOnceWith(
          paramsMock.context,
          valueFixture,
        );
      });

      it('should return value', () => {
        expect(result).toBe(activationResult);
      });
    });

    describe('when called, and params.getActivations() returns async activations', () => {
      let activationMock: Mock<BindingActivation>;
      let activationResult: unknown;

      let result: unknown;

      beforeAll(async () => {
        activationResult = Symbol('activation-result');

        activationMock = vitest.fn().mockResolvedValueOnce(activationResult);

        paramsMock.getActivations.mockReturnValueOnce([activationMock]);

        result = await resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getActivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(activationMock).toHaveBeenCalledExactlyOnceWith(
          paramsMock.context,
          valueFixture,
        );
      });

      it('should return value', () => {
        expect(result).toBe(activationResult);
      });
    });
  });

  describe('having a promise value', () => {
    let paramsMock: Mocked<ResolutionParams>;
    let serviceIdentifierFixture: ServiceIdentifier;
    let valueFixture: unknown;

    beforeAll(() => {
      paramsMock = {
        getActivations: vitest.fn(),
      } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
      serviceIdentifierFixture = 'service-id';
      valueFixture = Symbol();
    });

    describe('when called, and params.getActivations() returns undefined', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          Promise.resolve(valueFixture),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getActivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should return value', () => {
        expect(result).toBe(valueFixture);
      });
    });

    describe('when called, and params.getActivations() returns sync activations', () => {
      let activationMock: Mock<BindingActivation>;
      let activationResult: unknown;

      let result: unknown;

      beforeAll(async () => {
        activationResult = Symbol('activation-result');

        activationMock = vitest.fn().mockReturnValueOnce(activationResult);

        paramsMock.getActivations.mockReturnValueOnce([activationMock]);

        result = await resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          Promise.resolve(valueFixture),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getActivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(activationMock).toHaveBeenCalledExactlyOnceWith(
          paramsMock.context,
          valueFixture,
        );
      });

      it('should return value', () => {
        expect(result).toBe(activationResult);
      });
    });

    describe('when called, and params.getActivations() returns async activations', () => {
      let activationMock: Mock<BindingActivation>;
      let activationResult: unknown;

      let result: unknown;

      beforeAll(async () => {
        activationResult = Symbol('activation-result');

        activationMock = vitest.fn().mockResolvedValueOnce(activationResult);

        paramsMock.getActivations.mockReturnValueOnce([activationMock]);

        result = await resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          Promise.resolve(valueFixture),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getActivations', () => {
        expect(paramsMock.getActivations).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call activation', () => {
        expect(activationMock).toHaveBeenCalledExactlyOnceWith(
          paramsMock.context,
          valueFixture,
        );
      });

      it('should return value', () => {
        expect(result).toBe(activationResult);
      });
    });
  });
});
