# Unit testing

Almost every module created must include its tests. Test modules must be written at the same directory using `vitest`.

## Structure of a test module

Test modules are composed by nested `describe` calls. Every describe call includes a block with nested `describe` calls. Every `describe` block is associated with a certain scope of the original implementation.

### 1. The class scope

The first describe block contains the scope of the tested class. It should declare an instance of the class to be tested if the class is stateless.

The class `Foo`

```ts
export class Foo {
  constructor(private readonly bar: Bar) {}

  ...
}
```

Could be tested with the following implementation

```ts
describe(Foo, () => {
  let barMock: Mocked<Bar>;
  let foo: Foo;

  beforeAll(() => {
    barMock = {
      ...,
    };

    foo = new Foo(barMock);
  });

  ...
});

```

### 2. The method / function scope

The second describe block is the method one. All the tests regarding a class public method must be in the method scope

The class `Foo`

```ts
export class Foo {
  constructor(private readonly bar: Bar) {}

  public sayHello(): void {
    ...
  }
}

```

Could be tested with the following implementation

```ts
describe(Foo, () => {
  let barMock: Mocked<Bar>;
  let foo: Foo;

  beforeAll(() => {
    barMock = {
      ...,
    };

    foo = new Foo(barMock);
  });

  describe('.sayHello', () => {
    ...
  });
});

```

### 3. The method input scope

Specific inputs could be required in order to test certain flows. For example:

```ts
public composeHelloMessage(name: string): string {
  if (name === 'Zoe') {
    return 'Talk to my hand Zoe';
  } else {
    return `Hi ${name}, I'm glad to see you`;
  }
}

```

Two different inputs are required:

1. The string `'Zoe'`.
2. Any string different than `Zoe`.

In these cases a describe block for each case is required.

The class `Foo`

```ts
export class Foo {
  constructor(private readonly bar: Bar) {}

  public composeHelloMessage(name: string): string {
    if (name === 'Zoe') {
      return 'Talk to my hand Zoe';
    } else {
      return `Hi ${name}, I'm glad to see you`;
    }
  }
}

```

Could be tested with the following implementation

```ts
describe(Foo, () => {
  let barMock: Mocked<Bar>;
  let foo: Foo;

  beforeAll(() => {
    barMock = {
      ...,
    };

    foo = new Foo(barMock);
  });

  describe('.composeHelloMessage', () => {
    describe('having a name with value "Zoe"', () => {
      let nameFixture: string;

      beforeAll(() => {
        nameFixture = 'Zoe';
      });

      ...
    });

    describe('having a name with value different than "Zoe"', () => {
      let nameFixture: string;

      beforeAll(() => {
        nameFixture = 'Bob';
      });

      ...
    });
  });
});

```

### 4. The code flow scope

Every code flow should be covered in a describe block. If, given an input, only one flow is allowed, then the describe name associated should be `when called`. If not, it should be `when called, and [behavior]` where behavior is the dependencies behavior that leds to that code flow.

**Important note**: Sometimes several flows shares a common branch. Every flow must be tested but it's allowed to add describe blocks to test that common branch

Once we are in this scope, all the assertions associated with this code flow should be included.

The class Foo

```ts
export class Foo {
  constructor(private readonly bar: Bar) {}

  public composeHelloMessage(name: string): string {
    if (name === this.bar.getUnderisableName()) {
      return 'Talk to my hand';
    } else {
      return `Hi ${name}, I'm glad to see you`;
    }
  }
}

```

Could be tested with the following implementation

```ts
describe(Foo, () => {
  let barMock: Mocked<Bar>;
  let foo: Foo;

  beforeAll(() => {
    barMock = {
      ...,
    };

    foo = new Foo(barMock);
  });

  describe('.composeHelloMessage', () => {

    describe('when called', () => { // This is an example of common branch
      let undesirableNameFixture: string;
      let nameFixture: string;

      let result: unknown;

      beforeAll(() => {
        nameFixture = 'Anna';
        undesirableNameFixture = 'Carl';

        barMock.getUnderisableName.mockReturnValueOnce(undesirableNameFixture);

        result = foo.composeHelloMessage(nameFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bar.getUndesirableName()', () => {
        expect(barMock.getUnderisableName).toHavBeenCalledTimes(1);
        expect(barMock.getUnderisableName).toHavBeenCalledWith(nameFixture);
      });
    });

    describe('when called, and bar.getUndesirableName() is equal to name', () => {
      let undesirableNameFixture: string;
      let nameFixture: string;

      beforeAll(() => {
        nameFixture = 'Anna';
        undesirableNameFixture = nameFixture;

        result = foo.composeHelloMessage(nameFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return a string', () => {
        expect(result).toBe('Talk to my hand');
      });
    });

    describe('when called, and bar.getUndesirableName() is distinct to name', () => {
      let undesirableNameFixture: string;
      let nameFixture: string;

      let result: unknown;

      beforeAll(() => {
        nameFixture = 'Anna';
        undesirableNameFixture = 'Carl';

        barMock.getUnderisableName.mockReturnValueOnce(undesirableNameFixture);

        result = foo.composeHelloMessage(nameFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return a string', () => {
        expect(result).toBe(`Hi ${nameFixture}, I'm glad to see you`);
      });
    });
  });
});

```
