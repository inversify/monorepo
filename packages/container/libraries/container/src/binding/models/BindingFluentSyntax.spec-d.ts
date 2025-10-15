import {
  assertType,
  beforeAll,
  describe,
  expectTypeOf,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import { Factory } from '@inversifyjs/core';

import {
  BindInWhenOnFluentSyntax,
  BindToFluentSyntax,
  BindWhenOnFluentSyntax,
} from './BindingFluentSyntax';
import { ResolvedValueMetadataInjectOptions } from './ResolvedValueInjectOptions';

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('BindToFluentSyntax', () => {
  describe('.toFactory', () => {
    let bindToFluentSyntaxMock: Mocked<BindToFluentSyntax<Factory<unknown>>>;

    beforeAll(() => {
      bindToFluentSyntaxMock = {
        toFactory: vitest.fn(),
      } as Partial<Mocked<BindToFluentSyntax<Factory<unknown>>>> as Mocked<
        BindToFluentSyntax<Factory<unknown>>
      >;
    });

    describe('having an async factory', () => {
      let factoryFixture: () => Promise<Factory<unknown>>;

      beforeAll(() => {
        factoryFixture = async (): Promise<Factory<unknown>> => async () =>
          undefined;
      });

      it('when called, should not throw a syntax error', () => {
        expectTypeOf(
          bindToFluentSyntaxMock.toFactory(factoryFixture),
        ).toEqualTypeOf<BindWhenOnFluentSyntax<Factory<unknown>>>();
      });
    });
  });

  describe('.toResolvedValue', () => {
    let bindToFluentSyntaxMock: Mocked<BindToFluentSyntax<unknown>>;

    beforeAll(() => {
      bindToFluentSyntaxMock = {
        toResolvedValue: vitest.fn() as unknown,
      } as Partial<Mocked<BindToFluentSyntax<unknown>>> as Mocked<
        BindToFluentSyntax<unknown>
      >;
    });

    describe('having an async factory with no arguments', () => {
      let factoryFixture: () => Promise<unknown>;

      beforeAll(() => {
        factoryFixture = async (): Promise<unknown> => undefined;
      });

      it('when called, with no inject options, should not throw a syntax error', () => {
        expectTypeOf(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture),
        ).toEqualTypeOf<BindInWhenOnFluentSyntax<unknown>>();
      });
    });

    describe('having an async factory with a fixed number of primitive arguments', () => {
      let factoryFixture: (arg1: string, arg2: number) => Promise<unknown>;

      beforeAll(() => {
        factoryFixture = async (
          _arg1: string,
          _arg2: number,
        ): Promise<unknown> => undefined;
      });

      it('when called, with as many right service identifier inject options as function parameters, should not throw a syntax error', () => {
        const firstServiceIdentifier: ServiceIdentifier<string> = Symbol();
        const secondServiceIdentifier: ServiceIdentifier<number> = Symbol();

        expectTypeOf(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
            secondServiceIdentifier,
          ]),
        ).toEqualTypeOf<BindInWhenOnFluentSyntax<unknown>>();
      });
    });

    describe('having a factory with a fixed number of primitive arguments', () => {
      let factoryFixture: (arg1: string, arg2: number) => unknown;

      beforeAll(() => {
        factoryFixture = (arg1: string, arg2: number): unknown => {
          return { arg1, arg2 };
        };
      });

      it('when called, with no inject options, should throw a syntax error', () => {
        // @ts-expect-error :: Inject options are required
        assertType(bindToFluentSyntaxMock.toResolvedValue(factoryFixture));
      });

      it('when called, with less right inject options than function parameters, should throw a syntax error', () => {
        const firstServiceIdentifier: ServiceIdentifier<string> = Symbol();

        assertType(
          // @ts-expect-error :: Too few inject options are provided
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
          ]),
        );
      });

      it('when called, with as many right service identifier inject options as function parameters, should not throw a syntax error', () => {
        const firstServiceIdentifier: ServiceIdentifier<string> = Symbol();
        const secondServiceIdentifier: ServiceIdentifier<number> = Symbol();

        expectTypeOf(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
            secondServiceIdentifier,
          ]),
        ).toEqualTypeOf<BindInWhenOnFluentSyntax<unknown>>();
      });

      it('when called, with as many "wrong" service identifier inject options as function parameters, should throw a syntax error', () => {
        const firstServiceIdentifier: ServiceIdentifier<number> =
          Symbol() as ServiceIdentifier<number>;

        const secondServiceIdentifier: Newable<object> = Object;

        expectTypeOf(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
            secondServiceIdentifier,
          ]),
        ).toEqualTypeOf<BindInWhenOnFluentSyntax<unknown>>();
      });

      it('when called, with more right service identifier inject options than function parameters, should throw a syntax error', () => {
        const firstServiceIdentifier: ServiceIdentifier<string> = Symbol();
        const secondServiceIdentifier: ServiceIdentifier<string> = Symbol();
        const thirdServiceIdentifier: ServiceIdentifier<string> = Symbol();

        assertType(
          // @ts-expect-error :: Too many inject options are provided
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
            secondServiceIdentifier,
            thirdServiceIdentifier,
          ]),
        );
      });

      it('when called, with as many "wrong" resolve value inject options as function parameters, should not throw a syntax error', () => {
        const firstServiceIdentifier: ResolvedValueMetadataInjectOptions<string> =
          {
            // @ts-expect-error :: Unexpected isMultiple property
            isMultiple: true,
            serviceIdentifier: Symbol(),
          };

        const secondServiceIdentifier: ResolvedValueMetadataInjectOptions<number> =
          {
            // @ts-expect-error :: Unexpected optional property
            optional: true,
            serviceIdentifier: Symbol(),
          };

        const thirdServiceIdentifier: ResolvedValueMetadataInjectOptions<string> =
          {
            // @ts-expect-error :: Unexpected isMultiple property
            isMultiple: true,
            // The compiler is not currently failing due to the isMultiple related error
            optional: true,
            serviceIdentifier: Symbol(),
          };
        const fourthServiceIdentifier: ResolvedValueMetadataInjectOptions<number> =
          {
            serviceIdentifier: Symbol(),
          };

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
            secondServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            thirdServiceIdentifier,
            fourthServiceIdentifier,
          ]),
        );
      });
    });

    describe('having a factory with an array argument', () => {
      let factoryFixture: (arg1: string[]) => unknown;

      beforeAll(() => {
        factoryFixture = (arg1: string[]): unknown => arg1;
      });

      it('when called, with as many "wrong" resolve value inject options as function parameters, should not throw a syntax error', () => {
        const firstServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[]
        > = {
          isMultiple: true,
          serviceIdentifier: Symbol(),
        };

        const secondServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[]
        > = {
          // @ts-expect-error :: Unexpected optional inject option
          optional: true,
          serviceIdentifier: Symbol(),
        };

        const thirdServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[]
        > = {
          isMultiple: true,
          // @ts-expect-error :: Unexpected optional inject option
          optional: true,
          serviceIdentifier: Symbol(),
        };

        // @ts-expect-error :: Expected isMultiple inject option
        const fourthServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[]
        > = {
          serviceIdentifier: Symbol(),
        };

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            secondServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            thirdServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            fourthServiceIdentifier,
          ]),
        );
      });
    });

    describe('having a factory with an optional argument', () => {
      let factoryFixture: (arg1?: string) => string | undefined;

      beforeAll(() => {
        factoryFixture = (arg1?: string): string | undefined => arg1;
      });

      it('when called, with as many "wrong" resolve value inject options as function parameters, should not throw a syntax error', () => {
        const firstServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string | undefined
        > = {
          // @ts-expect-error :: Unexpected isMultiple inject option
          isMultiple: true,
          serviceIdentifier: Symbol(),
        };

        const secondServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string | undefined
        > = {
          optional: true,
          serviceIdentifier: Symbol(),
        };

        const thirdServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string | undefined
        > = {
          // @ts-expect-error :: Unexpected isMultiple inject option
          isMultiple: true,
          optional: true,
          serviceIdentifier: Symbol(),
        };

        const fourthServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string | undefined
        > = {
          serviceIdentifier: Symbol(),
        };

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            secondServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            thirdServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            fourthServiceIdentifier,
          ]),
        );
      });
    });

    describe('having a factory with an optional array argument', () => {
      let factoryFixture: (arg1?: string[]) => unknown;

      beforeAll(() => {
        factoryFixture = (arg1?: string[]): unknown => arg1;
      });

      it('when called, with as many "wrong" resolve value inject options as function parameters, should not throw a syntax error', () => {
        // @ts-expect-error :: Expected optional inject option
        const firstServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[] | undefined
        > = {
          isMultiple: true,
          serviceIdentifier: Symbol(),
        };

        // @ts-expect-error :: Expected isMultiple inject option
        const secondServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[] | undefined
        > = {
          optional: true,
          serviceIdentifier: Symbol(),
        };

        const thirdServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[] | undefined
        > = {
          isMultiple: true,
          optional: true,
          serviceIdentifier: Symbol(),
        };

        // @ts-expect-error :: Expected isMultiple and optional inject options
        const fourthServiceIdentifier: ResolvedValueMetadataInjectOptions<
          string[] | undefined
        > = {
          serviceIdentifier: Symbol(),
        };

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            firstServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            secondServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            thirdServiceIdentifier,
          ]),
        );

        assertType(
          bindToFluentSyntaxMock.toResolvedValue(factoryFixture, [
            fourthServiceIdentifier,
          ]),
        );
      });
    });
  });
});
