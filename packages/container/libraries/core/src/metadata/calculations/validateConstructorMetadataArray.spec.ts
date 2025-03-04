import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { validateConstructorMetadataArray } from './validateConstructorMetadataArray';

describe(validateConstructorMetadataArray.name, () => {
  describe('having an array with no empty values', () => {
    class Foo {}

    let arrayFixture: [ClassElementMetadata];

    beforeAll(() => {
      arrayFixture = [Symbol() as unknown as ClassElementMetadata];
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          validateConstructorMetadataArray(Foo, arrayFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should not throw an error', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an array with not enough values', () => {
    class Foo {
      constructor(public foo: string) {}
    }

    let arrayFixture: (ClassElementMetadata | undefined)[];

    beforeAll(() => {
      arrayFixture = [];
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          validateConstructorMetadataArray(Foo, arrayFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an error', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.missingInjectionDecorator,
          message: `Found unexpected missing metadata on type "Foo". "Foo" constructor requires at least 1 arguments, found 0 instead.
Are you using @inject, @multiInject or @unmanaged decorators in every non optional constructor argument?

If you're using typescript and want to rely on auto injection, set "emitDecoratorMetadata" compiler option to true`,
        };

        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having an array with empty values', () => {
    class Foo {}

    let arrayFixture: (ClassElementMetadata | undefined)[];

    beforeAll(() => {
      arrayFixture = new Array<ClassElementMetadata | undefined>(3);

      arrayFixture[1] = Symbol() as unknown as ClassElementMetadata;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          validateConstructorMetadataArray(Foo, arrayFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an error', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.missingInjectionDecorator,
          message: `Found unexpected missing metadata on type "Foo" at constructor indexes "0", "2".

Are you using @inject, @multiInject or @unmanaged decorators at those indexes?

If you're using typescript and want to rely on auto injection, set "emitDecoratorMetadata" compiler option to true`,
        };

        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
