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

vitest.mock(import('./resolveBindingActivationsFromIteratorAsync.js'));

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionContext } from '../models/ResolutionContext.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveBindingActivationsFromIterator } from './resolveBindingActivationsFromIterator.js';
import { resolveBindingActivationsFromIteratorAsync } from './resolveBindingActivationsFromIteratorAsync.js';

describe(resolveBindingActivationsFromIterator, () => {
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

    beforeAll(() => {
      result = resolveBindingActivationsFromIterator(
        paramsMock,
        valueFixture,
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
    let firstActivationMock: Mock<BindingActivation>;
    let firstActivationResultFixture: unknown;
    let secondActivationMock: Mock<BindingActivation>;
    let secondActivationResultFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      firstActivationResultFixture = Symbol('first-activation-result');
      secondActivationResultFixture = Symbol('second-activation-result');

      firstActivationMock = vitest
        .fn()
        .mockReturnValueOnce(firstActivationResultFixture);
      secondActivationMock = vitest
        .fn()
        .mockReturnValueOnce(secondActivationResultFixture);

      result = resolveBindingActivationsFromIterator(
        paramsMock,
        valueFixture,
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

  describe('when called, and activationsIterator has async activations', () => {
    let activationMock: Mock<BindingActivation>;
    let activationPromiseFixture: Promise<unknown>;
    let resolveBindingActivationsFromIteratorAsyncResultFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      activationPromiseFixture = Promise.resolve(Symbol('activation-result'));
      resolveBindingActivationsFromIteratorAsyncResultFixture = Symbol(
        'resolve-binding-activations-from-iterator-async-result',
      );

      activationMock = vitest
        .fn()
        .mockReturnValueOnce(activationPromiseFixture);

      vitest
        .mocked(resolveBindingActivationsFromIteratorAsync)
        .mockResolvedValueOnce(
          resolveBindingActivationsFromIteratorAsyncResultFixture,
        );

      result = resolveBindingActivationsFromIterator(
        paramsMock,
        valueFixture,
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

    it('should call resolveBindingActivationsFromIteratorAsync()', () => {
      expect(
        resolveBindingActivationsFromIteratorAsync,
      ).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        activationPromiseFixture,
        expect.any(Object),
      );
    });

    it('should return Promise', () => {
      expect(result).toStrictEqual(
        Promise.resolve(
          resolveBindingActivationsFromIteratorAsyncResultFixture,
        ),
      );
    });
  });
});
