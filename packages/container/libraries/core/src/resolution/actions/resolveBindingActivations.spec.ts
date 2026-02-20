import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveBindingServiceActivations.js'));

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type ResolutionContext } from '../models/ResolutionContext.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveBindingActivations } from './resolveBindingActivations.js';
import { resolveBindingServiceActivations } from './resolveBindingServiceActivations.js';

describe(resolveBindingActivations, () => {
  describe('having a binding with no activation', () => {
    let paramsMock: Mocked<ResolutionParams>;
    let bindingFixture: ConstantValueBinding<unknown>;
    let resolvedValueFixture: unknown;

    beforeAll(() => {
      paramsMock = {
        getActivations: vitest.fn(),
        getBindings: vitest.fn(),
      } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
      bindingFixture = ConstantValueBindingFixtures.withOnActivationUndefined;
      resolvedValueFixture = Symbol();
    });

    describe('when called', () => {
      let resolveBindingServiceActivationsResultFixture: unknown;
      let result: unknown;

      beforeAll(() => {
        resolveBindingServiceActivationsResultFixture = Symbol();

        vitest
          .mocked(resolveBindingServiceActivations)
          .mockReturnValueOnce(resolveBindingServiceActivationsResultFixture);

        result = resolveBindingActivations(
          paramsMock,
          bindingFixture,
          resolvedValueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingServiceActivations()', () => {
        expect(
          resolveBindingServiceActivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          resolvedValueFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveBindingServiceActivationsResultFixture);
      });
    });
  });

  describe('having a binding with activation', () => {
    let onActivationMock: Mock<(value: unknown) => unknown>;
    let paramsMock: Mocked<ResolutionParams>;
    let bindingFixture: ConstantValueBinding<unknown>;
    let resolvedValue: unknown;

    beforeAll(() => {
      onActivationMock = vitest.fn();
      paramsMock = {
        context: Symbol() as unknown as Mocked<ResolutionContext>,
        getActivations: vitest.fn(),
        getBindings: vitest.fn(),
      } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
      bindingFixture = {
        ...ConstantValueBindingFixtures.any,
        onActivation: onActivationMock,
      };
      resolvedValue = Symbol();
    });

    describe('when called', () => {
      let onActivationResultFixture: unknown;
      let resolveBindingServiceActivationsResultFixture: unknown;
      let result: unknown;

      beforeAll(() => {
        onActivationResultFixture = Symbol();
        resolveBindingServiceActivationsResultFixture = Symbol();

        onActivationMock.mockReturnValueOnce(onActivationResultFixture);

        vitest
          .mocked(resolveBindingServiceActivations)
          .mockReturnValueOnce(resolveBindingServiceActivationsResultFixture);

        result = resolveBindingActivations(
          paramsMock,
          bindingFixture,
          resolvedValue,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.onActivation()', () => {
        expect(onActivationMock).toHaveBeenCalledExactlyOnceWith(
          paramsMock.context,
          resolvedValue,
        );
      });

      it('should call resolveBindingServiceActivations()', () => {
        expect(
          resolveBindingServiceActivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          onActivationResultFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveBindingServiceActivationsResultFixture);
      });
    });
  });
});
