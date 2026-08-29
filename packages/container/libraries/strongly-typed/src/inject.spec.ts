/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable vitest/expect-expect */
import { describe, it } from 'vitest';

import type { TypedInject, TypedMultiInject } from './inject.js';

describe('TypedInject', () => {
  class Foo {
    public foo: string = '';
  }

  class Bar {
    public bar: string = '';
  }

  interface BindingMap {
    foo: Foo;
    bar: Bar;
    asyncNumber: Promise<number>;
  }

  it('strongly types injected properties', () => {
    class Test {
      public foo!: TypedInject<'foo', BindingMap>;
      public readonly bar!: TypedInject<'bar', BindingMap>;
      public num!: TypedInject<'asyncNumber', BindingMap>;
    }

    const t = new Test();
    const _foo: Foo = t.foo;
    const _bar: Bar = t.bar;
    const _num: number = t.num;
  });

  it('strongly types injected constructor parameters', () => {
    class Test {
      constructor(
        public foo: TypedInject<'foo', BindingMap>,
        public bar: TypedInject<'bar', BindingMap>,
        public num: TypedInject<'asyncNumber', BindingMap>,
      ) {}
    }

    const t = new Test(new Foo(), new Bar(), 42);
    const _foo: Foo = t.foo;
    const _bar: Bar = t.bar;
    const _num: number = t.num;
  });

  it('rejects unknown binding keys', () => {
    class Test {
      // @ts-expect-error :: 'unknown' is not in BindingMap
      public bad!: TypedInject<'unknown', BindingMap>;
    }
    Test;
  });

  describe('TypedMultiInject', () => {
    it('strongly types multi-injected properties', () => {
      class Test {
        public foos!: TypedMultiInject<'foo', BindingMap>;
        public readonly bars!: TypedMultiInject<'bar', BindingMap>;
      }

      const t = new Test();
      const _foos: Foo[] = t.foos;
      const _bars: Bar[] = t.bars;
    });

    it('strongly types multi-injected constructor parameters', () => {
      class Test {
        constructor(
          public foos: TypedMultiInject<'foo', BindingMap>,
          public bars: TypedMultiInject<'bar', BindingMap>,
        ) {}
      }

      const t = new Test([new Foo()], [new Bar()]);
      const _foos: Foo[] = t.foos;
      const _bars: Bar[] = t.bars;
    });

    it('rejects unknown binding keys', () => {
      class Test {
        // @ts-expect-error :: 'unknown' is not in BindingMap
        public bad!: TypedMultiInject<'unknown', BindingMap>;
      }
      Test;
    });
  });
});
