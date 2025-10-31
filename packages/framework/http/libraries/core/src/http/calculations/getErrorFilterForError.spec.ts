import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');

import { ErrorFilter } from '@inversifyjs/framework-core';
import { getBaseType } from '@inversifyjs/prototype-utils';
import { Container, Newable } from 'inversify';

import { getErrorFilterForError } from './getErrorFilterForError';

describe(getErrorFilterForError, () => {
  let containerMock: Mocked<Container>;

  beforeAll(() => {
    containerMock = {
      getAsync: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;
  });

  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('having an error instance and one filter map list with error filter entry', () => {
    describe('when called', () => {
      class CustomError extends Error {}

      let errorFixture: CustomError;
      let errorFilterFixture: ErrorFilter;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');
        errorFilterFixture = {
          catch: vitest.fn(),
        };

        errorToFilterMapListFixture = [
          new Map([[CustomError, errorFilterFixture]]),
        ];

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return expected result', () => {
        expect(result).toBe(errorFilterFixture);
      });
    });
  });

  describe('having an error instance and one filter map list with error filter entry for base error type', () => {
    describe('when called', () => {
      class CustomError extends Error {}

      let errorFixture: CustomError;
      let errorFilterFixture: ErrorFilter;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');
        errorFilterFixture = {
          catch: vitest.fn(),
        } as unknown as ErrorFilter;

        errorToFilterMapListFixture = [new Map([[Error, errorFilterFixture]])];

        vitest.mocked(getBaseType).mockReturnValueOnce(Error);

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBaseType()', () => {
        expect(getBaseType).toHaveBeenCalledExactlyOnceWith(CustomError);
      });

      it('should return expected result', () => {
        expect(result).toBe(errorFilterFixture);
      });
    });
  });

  describe('having an error instance and a filter map list with one element with error filter type entry', () => {
    describe('when called', () => {
      class CustomError extends Error {}
      class CustomErrorFilter implements ErrorFilter {
        public catch(): void {}
      }

      let errorFixture: CustomError;
      let errorFilterTypeFixture: Newable<ErrorFilter>;
      let errorFilterInstanceFixture: ErrorFilter;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');
        errorFilterTypeFixture = CustomErrorFilter as Newable<ErrorFilter>;
        errorFilterInstanceFixture = {
          catch: vitest.fn(),
        };

        errorToFilterMapListFixture = [
          new Map([[CustomError, errorFilterTypeFixture]]),
        ];

        containerMock.getAsync.mockResolvedValueOnce(
          errorFilterInstanceFixture,
        );

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call container.getAsync()', () => {
        expect(containerMock.getAsync).toHaveBeenCalledExactlyOnceWith(
          errorFilterTypeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(errorFilterInstanceFixture);
      });
    });
  });

  describe('having an error instance and a filter map list with one element with error filter entry for null', () => {
    describe('when called', () => {
      class CustomError extends Error {}

      let errorFixture: CustomError;
      let errorFilterFixture: ErrorFilter;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');
        errorFilterFixture = {
          catch: vitest.fn(),
        } as unknown as ErrorFilter;

        errorToFilterMapListFixture = [new Map([[null, errorFilterFixture]])];

        vitest.mocked(getBaseType).mockReturnValueOnce(Error);

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBaseType()', () => {
        expect(getBaseType).toHaveBeenCalledExactlyOnceWith(CustomError);
      });

      it('should return expected result', () => {
        expect(result).toBe(errorFilterFixture);
      });
    });
  });

  describe('having an error instance and a filter map list with one empty element', () => {
    describe('when called', () => {
      class CustomError extends Error {}

      let errorFixture: CustomError;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');

        errorToFilterMapListFixture = [new Map()];

        vitest.mocked(getBaseType).mockReturnValueOnce(Error);

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBaseType()', () => {
        expect(getBaseType).toHaveBeenCalledExactlyOnceWith(CustomError);
      });

      it('should return expected result', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an error instance and two filter map lists with error filter entries', () => {
    describe('when called', () => {
      class CustomError extends Error {}

      let errorFixture: CustomError;
      let firstErrorFilterFixture: ErrorFilter;
      let secondErrorFilterFixture: ErrorFilter;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');
        firstErrorFilterFixture = {
          catch: vitest.fn(),
        };
        secondErrorFilterFixture = {
          catch: vitest.fn(),
        };

        errorToFilterMapListFixture = [
          new Map([[CustomError, firstErrorFilterFixture]]),
          new Map([[CustomError, secondErrorFilterFixture]]),
        ];

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return expected result', () => {
        expect(result).toBe(firstErrorFilterFixture);
      });
    });
  });

  describe('having an error instance and two filter map lists with error filter entry in the second map', () => {
    describe('when called, and error filter is found in second map', () => {
      class CustomError extends Error {}

      let errorFixture: CustomError;
      let errorFilterFixture: ErrorFilter;
      let errorToFilterMapListFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      >[];

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new CustomError('Test error');
        errorFilterFixture = {
          catch: vitest.fn(),
        } as unknown as ErrorFilter;

        errorToFilterMapListFixture = [
          new Map(),
          new Map([[CustomError, errorFilterFixture]]),
        ];

        result = await getErrorFilterForError(
          containerMock,
          errorFixture,
          errorToFilterMapListFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the error filter instance from second map', () => {
        expect(result).toBe(errorFilterFixture);
      });
    });
  });
});
