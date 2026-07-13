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

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionContext } from '../models/ResolutionContext.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveBindingActivationsFromIteratorAsync } from './resolveBindingActivationsFromIteratorAsync.js';

describe(resolveBindingActivationsFromIteratorAsync, () => {
  let paramsMock: Mocked<ResolutionParams>;
  let valueFixture: unknown;

  beforeAll(() => {
    paramsMock = {
      context: Symbol() as unknown as Mocked<ResolutionContext>,
    } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
    valueFixture = Symbol();
  });

  describe('when called, and activationsIterator has no activations', () => {
    let result: unknown;

    beforeAll(async () => {
      result = await resolveBindingActivationsFromIteratorAsync(
        paramsMock,
        Promise.resolve(valueFixture),
        [][Symbol.iterator](),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return value', () => {
      expect(result).toBe(valueFixture);
    });
  });

  describe('when called, and activationsIterator has sync activations', () => {
    let activationMock: Mock<BindingActivation>;
    let activationResultFixture: unknown;

    let result: unknown;

    beforeAll(async () => {
      activationResultFixture = Symbol('activation-result');

      activationMock = vitest.fn().mockReturnValueOnce(activationResultFixture);

      result = await resolveBindingActivationsFromIteratorAsync(
        paramsMock,
        Promise.resolve(valueFixture),
        [activationMock][Symbol.iterator](),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call activation', () => {
      expect(activationMock).toHaveBeenCalledExactlyOnceWith(
        paramsMock.context,
        valueFixture,
      );
    });

    it('should return value', () => {
      expect(result).toBe(activationResultFixture);
    });
  });

  describe('when called, and activationsIterator has async activations', () => {
    let firstActivationMock: Mock<BindingActivation>;
    let firstActivationResultFixture: unknown;
    let secondActivationMock: Mock<BindingActivation>;
    let secondActivationResultFixture: unknown;

    let result: unknown;

    beforeAll(async () => {
      firstActivationResultFixture = Symbol('first-activation-result');
      secondActivationResultFixture = Symbol('second-activation-result');

      firstActivationMock = vitest
        .fn()
        .mockResolvedValueOnce(firstActivationResultFixture);
      secondActivationMock = vitest
        .fn()
        .mockResolvedValueOnce(secondActivationResultFixture);

      result = await resolveBindingActivationsFromIteratorAsync(
        paramsMock,
        Promise.resolve(valueFixture),
        [firstActivationMock, secondActivationMock][Symbol.iterator](),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call first activation', () => {
      expect(firstActivationMock).toHaveBeenCalledExactlyOnceWith(
        paramsMock.context,
        valueFixture,
      );
    });

    it('should call second activation', () => {
      expect(secondActivationMock).toHaveBeenCalledExactlyOnceWith(
        paramsMock.context,
        firstActivationResultFixture,
      );
    });

    it('should return value', () => {
      expect(result).toBe(secondActivationResultFixture);
    });
  });
});
