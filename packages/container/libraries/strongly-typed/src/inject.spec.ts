/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable vitest/expect-expect */
import { describe, it } from 'vitest';

import 'reflect-metadata/lite';

import { inject, injectable, multiInject } from 'inversify';

import type { TypedInject, TypedMultiInject } from './inject';

describe(inject, () => {
  @injectable()
  class Foo {
    public foo: string = '';
  }

  @injectable()
  class Bar {
    public bar: string = '';
  }

  interface BindingMap {
    foo: Foo;
    bar: Bar;
    asyncNumber: Promise<number>;
  }

  const $inject: TypedInject<BindingMap> = inject as TypedInject<BindingMap>;

  it('strongly types injected properties', () => {
    class Test {
      @$inject('foo')
      public foo!: Foo;

      @$inject('bar')
      public readonly bar!: Bar;

      @$inject('asyncNumber')
      public num!: number;

      // @ts-expect-error :: expects type Bar
      @$inject('foo')
      public badFoo!: Bar;

      // @ts-expect-error :: unknown binding
      @$inject('unknown')
      public unknown!: unknown;
    }
    Test;
  });

  it('strongly types injected constructor parameters', () => {
    class Test {
      constructor(
        @$inject('foo')
        _foo: Foo,

        @$inject('bar')
        private readonly _bar: Bar,

        @$inject('asyncNumber')
        _num: number,

        // @ts-expect-error :: expects type Bar
        @$inject('foo')
        _badFoo: Bar,

        // @ts-expect-error :: unknown binding
        @$inject('unknown')
        _unknown: unknown,
      ) {}
    }
    Test;
  });

  describe(multiInject, () => {
    const $multiInject: TypedMultiInject<BindingMap> =
      multiInject as TypedMultiInject<BindingMap>;

    it('strongly types injected properties', () => {
      class Test {
        @$multiInject('foo')
        public foo!: Foo[];

        @$multiInject('bar')
        public readonly bar!: Bar[];

        @$multiInject('asyncNumber')
        public num!: number[];

        // @ts-expect-error :: expects type Bar
        @$multiInject('foo')
        public badFoo!: Bar[];

        // @ts-expect-error :: unknown binding
        @$multiInject('unknown')
        public unknown!: unknown[];
      }
      Test;
    });

    it('strongly types injected constructor parameters', () => {
      class Test {
        constructor(
          @$multiInject('foo')
          _foo: Foo[],

          @$multiInject('bar')
          private readonly _bar: Bar[],

          @$multiInject('asyncNumber')
          _num: number[],

          // @ts-expect-error :: expects type Bar
          @$multiInject('foo')
          _badFoo: Bar[],

          // @ts-expect-error :: unknown binding
          @$multiInject('unknown')
          _unknown: unknown[],
        ) {}
      }
      Test;
    });
  });
});
