import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { resolvePostConstruct } from './resolvePostConstruct';

type ActivatedTest = Record<string | symbol, unknown>;

describe(resolvePostConstruct, () => {
  describe('having instance with no properties and postConstructMethodName', () => {
    let instanceFixture: ActivatedTest;
    let bindingFixture: InstanceBinding<ActivatedTest>;
    let postConstructMethodNameFixture: string;

    beforeAll(() => {
      instanceFixture = {};
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        implementationType: class Foo implements ActivatedTest {
          [key: string | symbol]: unknown;
        },
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      };
      postConstructMethodNameFixture = 'post-construct-name-fixture';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          void resolvePostConstruct(
            instanceFixture,
            bindingFixture,
            postConstructMethodNameFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: `Expecting a "${postConstructMethodNameFixture}" property when resolving "${bindingFixture.implementationType.name}" class @postConstruct decorated method, none found.`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having instance with no method properties and postConstructMethodName', () => {
    let instanceFixture: ActivatedTest;
    let bindingFixture: InstanceBinding<ActivatedTest>;
    let postConstructMethodNameFixture: string;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        implementationType: class Foo implements ActivatedTest {
          [key: string | symbol]: unknown;
        },
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      };
      postConstructMethodNameFixture = 'post-construct-name-fixture';

      instanceFixture = {
        [postConstructMethodNameFixture]: 'non-method-value',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          void resolvePostConstruct(
            instanceFixture,
            bindingFixture,
            postConstructMethodNameFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: `Expecting a "${postConstructMethodNameFixture}" method when resolving "${bindingFixture.implementationType.name}" class @postConstruct decorated method, a non function property was found instead.`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having instance with method properties and postConstructMethodName', () => {
    let instanceFixture: ActivatedTest;
    let bindingFixture: InstanceBinding<ActivatedTest>;
    let postConstructMethodNameFixture: string;

    let postConstructMethodMock: Mock<() => void | Promise<void>>;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        implementationType: class Foo implements ActivatedTest {
          [key: string | symbol]: unknown;
        },
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      };
      postConstructMethodNameFixture = 'post-construct-name-fixture';

      postConstructMethodMock = vitest.fn();

      instanceFixture = {
        [postConstructMethodNameFixture]: postConstructMethodMock,
      };
    });

    describe('when called, and postConstructMethod returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePostConstruct(
          instanceFixture,
          bindingFixture,
          postConstructMethodNameFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call post construct method', () => {
        expect(postConstructMethodMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return instance', () => {
        expect(result).toBe(instanceFixture);
      });
    });

    describe('when called, and postConstructMethod throws an error', () => {
      let errorFixture: Error;

      let result: unknown;

      beforeAll(() => {
        errorFixture = new Error('Error fixture');

        postConstructMethodMock.mockImplementationOnce((): never => {
          throw errorFixture;
        });

        try {
          void resolvePostConstruct(
            instanceFixture,
            bindingFixture,
            postConstructMethodNameFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call post construct method', () => {
        expect(postConstructMethodMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: `Unexpected error found when calling "${postConstructMethodNameFixture}" @postConstruct decorated method on class "${bindingFixture.implementationType.name}"`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });

    describe('when called, and postConstructMethod returns a promise', () => {
      let result: unknown;

      beforeAll(async () => {
        postConstructMethodMock.mockResolvedValueOnce(undefined);

        result = await resolvePostConstruct(
          instanceFixture,
          bindingFixture,
          postConstructMethodNameFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call post construct method', () => {
        expect(postConstructMethodMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return instance', () => {
        expect(result).toBe(instanceFixture);
      });
    });

    describe('when called, and postConstructMethod returns a rejected promise', () => {
      let errorFixture: Error;

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new Error('Error fixture');

        postConstructMethodMock.mockImplementationOnce(
          async (): Promise<void> => {
            throw errorFixture;
          },
        );

        try {
          await resolvePostConstruct(
            instanceFixture,
            bindingFixture,
            postConstructMethodNameFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call post construct method', () => {
        expect(postConstructMethodMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: `Unexpected error found when calling "${postConstructMethodNameFixture}" @postConstruct decorated method on class "${bindingFixture.implementationType.name}"`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
