import { beforeAll, describe, expect, it } from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildResolveMany } from './buildResolveMany.js';

function buildNodeFixture(
  constructorArgumentsLength: number,
  propertiesSize: number = 0,
): InstanceBindingNode<unknown, InstanceBinding<unknown>> {
  const properties: Map<string | symbol, ClassElementMetadata> = new Map();

  for (let index: number = 0; index < propertiesSize; ++index) {
    properties.set(
      `property-${index.toString()}`,
      Symbol() as unknown as ClassElementMetadata,
    );
  }

  return {
    classMetadata: {
      constructorArguments: new Array<ClassElementMetadata>(
        constructorArgumentsLength,
      ).fill(Symbol() as unknown as ClassElementMetadata),
      lifecycle: {
        postConstructMethodNames: new Set(),
        preDestroyMethodNames: new Set(),
      },
      properties,
      scope: undefined,
    },
    constructorParams: [] as PlanServiceNode[],
  } as Partial<
    InstanceBindingNode<unknown, InstanceBinding<unknown>>
  > as InstanceBindingNode<unknown, InstanceBinding<unknown>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolveManyFunction = (...args: any[]) => any;

describe(buildResolveMany, () => {
  describe('having zero constructor arguments', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(0),
        ) as ResolveManyFunction;

        result = resolveMany(() => []);
      });

      it('should build with no resolved values', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having zero constructor arguments and five properties', () => {
    describe('when called, and all values are sync', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(0, 5),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          3,
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual([1, 2, 3, 4, 5]);
      });
    });

    describe('when called, and a value is a promise', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(0, 5),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          Promise.resolve(3),
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });
  });

  describe('having two constructor arguments and three properties', () => {
    describe('when called, and all values are sync', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(2, 3),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          3,
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual([1, 2, 3, 4, 5]);
      });
    });
  });

  describe('having one constructor argument', () => {
    describe('when called, and the value is sync', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(1),
        ) as ResolveManyFunction;

        result = resolveMany(1, (value: number) => [value]);
      });

      it('should build with the resolved value', () => {
        expect(result).toStrictEqual([1]);
      });
    });

    describe('when called, and the value is a promise', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(1),
        ) as ResolveManyFunction;

        result = resolveMany(Promise.resolve(1), (value: number) => [value]);
      });

      it('should build with the resolved value', () => {
        expect(result).toStrictEqual(Promise.resolve([1]));
      });
    });
  });

  describe('having two constructor arguments', () => {
    describe('when called, and both values are sync', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(2),
        ) as ResolveManyFunction;

        result = resolveMany(1, 2, (value1: number, value2: number) => [
          value1,
          value2,
        ]);
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual([1, 2]);
      });
    });

    describe('when called, and both values are promises', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(2),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          Promise.resolve(2),
          (value1: number, value2: number) => [value1, value2],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2]));
      });
    });

    describe('when called, and one value and one promise are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(2),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          Promise.resolve(2),
          (value1: number, value2: number) => [value1, value2],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2]));
      });
    });

    describe('when called, and one promise and one value are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(2),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          2,
          (value1: number, value2: number) => [value1, value2],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2]));
      });
    });
  });

  describe('having three constructor arguments', () => {
    describe('when called, and all values are sync', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          3,
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    });

    describe('when called, and two values and one promise are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          Promise.resolve(3),
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });

    describe('when called, and one value, one promise and one value are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          Promise.resolve(2),
          3,
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });

    describe('when called, and one value and two promises are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          Promise.resolve(2),
          Promise.resolve(3),
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });

    describe('when called, and one promise and two values are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          2,
          3,
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });

    describe('when called, and one promise, one value and one promise are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          2,
          Promise.resolve(3),
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });

    describe('when called, and two promises and one value are provided', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          Promise.resolve(2),
          3,
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });

    describe('when called, and all values are promises', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(3),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          Promise.resolve(2),
          Promise.resolve(3),
          (value1: number, value2: number, value3: number) => [
            value1,
            value2,
            value3,
          ],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
      });
    });
  });

  describe('having five constructor arguments', () => {
    describe('when called, and all values are sync', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(5),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          3,
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual([1, 2, 3, 4, 5]);
      });
    });

    describe('when called, and all values are promises', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(5),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          Promise.resolve(2),
          Promise.resolve(3),
          Promise.resolve(4),
          Promise.resolve(5),
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });

    describe('when called, and the first value is a promise', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(5),
        ) as ResolveManyFunction;

        result = resolveMany(
          Promise.resolve(1),
          2,
          3,
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });

    describe('when called, and the last value is a promise', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(5),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          3,
          4,
          Promise.resolve(5),
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });

    describe('when called, and a middle value is a promise', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveMany: ResolveManyFunction = buildResolveMany(
          buildNodeFixture(5),
        ) as ResolveManyFunction;

        result = resolveMany(
          1,
          2,
          Promise.resolve(3),
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with resolved values in order', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });
  });
});
