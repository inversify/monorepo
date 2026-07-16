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
import { type ResolutionContext } from '../models/ResolutionContext.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveBindingActivationsFromIterator } from './resolveBindingActivationsFromIterator.js';
import { resolveBindingActivationsFromIteratorAsync } from './resolveBindingActivationsFromIteratorAsync.js';
import { resolveBindingServiceActivations } from './resolveBindingServiceActivations.js';

describe(resolveBindingServiceActivations, () => {
  describe('having a non promise value', () => {
    let paramsMock: Mocked<ResolutionParams>;
    let serviceIdentifierFixture: ServiceIdentifier;
    let valueFixture: unknown;

    beforeAll(() => {
      paramsMock = {
        context: {
          getActivations: vitest.fn(),
        } as Partial<Mocked<ResolutionContext>> as Mocked<ResolutionContext>,
      } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
      serviceIdentifierFixture = 'service-id';
      valueFixture = Symbol();
    });

    describe('when called, and params.context.getActivations() returns undefined', () => {
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

      it('should call params.context.getActivations', () => {
        expect(
          paramsMock.context.getActivations,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should return value', () => {
        expect(result).toBe(valueFixture);
      });
    });

    describe('when called, and params.context.getActivations() returns activations', () => {
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

        vitest
          .mocked(paramsMock.context.getActivations)
          .mockReturnValueOnce(activationsIterableFixture);

        vitest
          .mocked(resolveBindingActivationsFromIterator)
          .mockReturnValueOnce(
            resolveBindingActivationsFromIteratorResultFixture,
          );

        result = resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          valueFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.context.getActivations', () => {
        expect(
          paramsMock.context.getActivations,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
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
        context: {
          getActivations: vitest.fn(),
        } as Partial<Mocked<ResolutionContext>> as Mocked<ResolutionContext>,
      } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;
      serviceIdentifierFixture = 'service-id';
      valueFixture = Symbol();
    });

    describe('when called, and params.context.getActivations() returns undefined', () => {
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

      it('should call params.context.getActivations', () => {
        expect(
          paramsMock.context.getActivations,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should return value', () => {
        expect(result).toBe(valueFixture);
      });
    });

    describe('when called, and params.context.getActivations() returns activations', () => {
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

        vitest
          .mocked(paramsMock.context.getActivations)
          .mockReturnValueOnce(activationsIterableFixture);

        vitest
          .mocked(resolveBindingActivationsFromIteratorAsync)
          .mockResolvedValueOnce(
            resolveBindingActivationsFromIteratorAsyncResultFixture,
          );

        result = await resolveBindingServiceActivations(
          paramsMock,
          serviceIdentifierFixture,
          valuePromiseFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.context.getActivations', () => {
        expect(
          paramsMock.context.getActivations,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
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
