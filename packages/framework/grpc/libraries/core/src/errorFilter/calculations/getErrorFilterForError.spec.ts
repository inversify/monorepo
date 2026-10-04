import { beforeAll, describe, expect, it } from 'vitest';

import { Discriminated, type ErrorFilter } from '@inversifyjs/framework-core';
import { Container, injectable, type Newable } from 'inversify';

import { getErrorFilterForError } from './getErrorFilterForError.js';

describe(getErrorFilterForError, () => {
  describe('having no matching filter', () => {
    describe('when called', () => {
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        resultFixture = await getErrorFilterForError(
          new Container(),
          new Error('miss'),
          [],
          [],
        );
      });

      it('should return undefined', () => {
        expect(resultFixture).toBeUndefined();
      });
    });
  });

  describe('having an error filter instance', () => {
    describe('when called', () => {
      let filterFixture: ErrorFilter;
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        filterFixture = {
          catch: (): string => 'instance',
        };

        const typeMap: Map<
          Newable<Error> | null,
          ErrorFilter | Newable<ErrorFilter>
        > = new Map([[Error, filterFixture]]);

        resultFixture = await getErrorFilterForError(
          new Container(),
          new Error('instance'),
          [],
          [typeMap],
        );
      });

      it('should return the error filter instance', () => {
        expect(resultFixture).toBe(filterFixture);
      });
    });
  });

  describe('having an error filter class', () => {
    describe('when called', () => {
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        @injectable()
        class ResolvedFilter implements ErrorFilter {
          public catch(): string {
            return 'resolved';
          }
        }

        const container: Container = new Container();

        container.bind(ResolvedFilter).toSelf();

        const typeMap: Map<
          Newable<Error> | null,
          ErrorFilter | Newable<ErrorFilter>
        > = new Map([[Error, ResolvedFilter]]);

        resultFixture = await getErrorFilterForError(
          container,
          new Error('class'),
          [],
          [typeMap],
        );
      });

      it('should resolve the error filter from the container', () => {
        expect(resultFixture).toBeInstanceOf(Object);
        expect(
          resultFixture?.catch(new Error('class'), undefined, undefined),
        ).toBe('resolved');
      });
    });
  });

  describe('having a base error type', () => {
    describe('when called', () => {
      let filterFixture: ErrorFilter;
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        class ChildError extends TypeError {}

        filterFixture = {
          catch: (): string => 'base',
        };

        const typeMap: Map<
          Newable<Error> | null,
          ErrorFilter | Newable<ErrorFilter>
        > = new Map([[TypeError, filterFixture]]);

        resultFixture = await getErrorFilterForError(
          new Container(),
          new ChildError('child'),
          [],
          [typeMap],
        );
      });

      it('should return the base error filter', () => {
        expect(resultFixture).toBe(filterFixture);
      });
    });
  });

  describe('having a discriminated error', () => {
    describe('when called', () => {
      let discriminatorFilterFixture: ErrorFilter;
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        @Discriminated('hero')
        class HeroError extends Error {}

        discriminatorFilterFixture = {
          catch: (): string => 'discriminator',
        };

        const typeFilter: ErrorFilter = {
          catch: (): string => 'type',
        };
        const discriminatorMap: Map<string | symbol, ErrorFilter> = new Map([
          ['hero', discriminatorFilterFixture],
        ]);
        const typeMap: Map<Newable<Error> | null, ErrorFilter> = new Map([
          [HeroError, typeFilter],
        ]);

        resultFixture = await getErrorFilterForError(
          new Container(),
          new HeroError('hero'),
          [discriminatorMap],
          [typeMap],
        );
      });

      it('should prefer the discriminator filter', () => {
        expect(resultFixture).toBe(discriminatorFilterFixture);
      });
    });
  });

  describe('having a catch-all filter', () => {
    describe('when called', () => {
      let filterFixture: ErrorFilter;
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        filterFixture = {
          catch: (): string => 'catch-all',
        };

        const typeMap: Map<Newable<Error> | null, ErrorFilter> = new Map([
          [null, filterFixture],
        ]);

        resultFixture = await getErrorFilterForError(
          new Container(),
          'plain',
          [],
          [typeMap],
        );
      });

      it('should return the catch-all filter', () => {
        expect(resultFixture).toBe(filterFixture);
      });
    });
  });

  describe('having a later filter map', () => {
    describe('when called', () => {
      let filterFixture: ErrorFilter;
      let resultFixture: ErrorFilter | undefined;

      beforeAll(async () => {
        filterFixture = {
          catch: (): string => 'second-map',
        };

        const secondMap: Map<Newable<Error> | null, ErrorFilter> = new Map([
          [Error, filterFixture],
        ]);

        resultFixture = await getErrorFilterForError(
          new Container(),
          new Error('later'),
          [],
          [new Map<Newable<Error> | null, ErrorFilter>(), secondMap],
        );
      });

      it('should return the filter from the later map', () => {
        expect(resultFixture).toBe(filterFixture);
      });
    });
  });
});
