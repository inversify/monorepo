import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveBindingActivationsFromIterator.js'));
vitest.mock(import('./resolveBindingActivationsFromIteratorAsync.js'));

import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveBindingActivationsFromIterator } from './resolveBindingActivationsFromIterator.js';
import { resolveBindingActivationsFromIteratorAsync } from './resolveBindingActivationsFromIteratorAsync.js';
import { resolveServiceActivations } from './resolveServiceActivations.js';

describe(resolveServiceActivations, () => {
  describe('having a non promise value', () => {
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

      beforeAll(() => {
        result = resolveServiceActivations(serviceIdentifierFixture)(
          paramsMock,
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

    describe('when called, and params.getActivations() returns activations', () => {
      let activationsIteratorFixture: Iterator<BindingActivation<unknown>>;
      let activationsIterableFixture: Iterable<BindingActivation<unknown>>;
      let resolveBindingActivationsFromIteratorResultFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        activationsIteratorFixture = Symbol(
          'activations-iterator',
        ) as unknown as Iterator<BindingActivation<unknown>>;
        activationsIterableFixture = {
          [Symbol.iterator]: () => activationsIteratorFixture,
        };
        resolveBindingActivationsFromIteratorResultFixture = Symbol(
          'resolve-binding-activations-from-iterator-result',
        );

        paramsMock.getActivations.mockReturnValueOnce(
          activationsIterableFixture,
        );

        vitest
          .mocked(resolveBindingActivationsFromIterator)
          .mockReturnValueOnce(
            resolveBindingActivationsFromIteratorResultFixture,
          );

        result = resolveServiceActivations(serviceIdentifierFixture)(
          paramsMock,
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

      it('should call resolveBindingActivationsFromIterator()', () => {
        expect(
          resolveBindingActivationsFromIterator,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          valueFixture,
          activationsIteratorFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveBindingActivationsFromIteratorResultFixture);
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
        result = await resolveServiceActivations(serviceIdentifierFixture)(
          paramsMock,
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

    describe('when called, and params.getActivations() returns activations', () => {
      let activationsIteratorFixture: Iterator<BindingActivation<unknown>>;
      let activationsIterableFixture: Iterable<BindingActivation<unknown>>;
      let resolveBindingActivationsFromIteratorAsyncResultFixture: unknown;
      let valuePromiseFixture: Promise<unknown>;

      let result: unknown;

      beforeAll(async () => {
        activationsIteratorFixture = Symbol(
          'activations-iterator',
        ) as unknown as Iterator<BindingActivation<unknown>>;
        activationsIterableFixture = {
          [Symbol.iterator]: () => activationsIteratorFixture,
        };
        resolveBindingActivationsFromIteratorAsyncResultFixture = Symbol(
          'resolve-binding-activations-from-iterator-async-result',
        );
        valuePromiseFixture = Promise.resolve(valueFixture);

        paramsMock.getActivations.mockReturnValueOnce(
          activationsIterableFixture,
        );

        vitest
          .mocked(resolveBindingActivationsFromIteratorAsync)
          .mockResolvedValueOnce(
            resolveBindingActivationsFromIteratorAsyncResultFixture,
          );

        result = await resolveServiceActivations(serviceIdentifierFixture)(
          paramsMock,
          valuePromiseFixture,
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

      it('should call resolveBindingActivationsFromIteratorAsync()', () => {
        expect(
          resolveBindingActivationsFromIteratorAsync,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          valuePromiseFixture,
          activationsIteratorFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(
          resolveBindingActivationsFromIteratorAsyncResultFixture,
        );
      });
    });
  });
});
