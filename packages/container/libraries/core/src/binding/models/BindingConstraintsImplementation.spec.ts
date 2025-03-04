import { beforeAll, describe, expect, it } from 'vitest';

import { BindingConstraints } from './BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from './BindingConstraintsImplementation';

describe(BindingConstraintsImplementation, () => {
  let internalBindingConstraintsFixture: InternalBindingConstraints;
  let bindingConstraintsImplementationFixture: BindingConstraintsImplementation;

  beforeAll(() => {
    internalBindingConstraintsFixture = {
      name: undefined,
      serviceIdentifier: 'service-id',
      tags: new Map(),
    };
    bindingConstraintsImplementationFixture =
      new BindingConstraintsImplementation({
        elem: internalBindingConstraintsFixture,
        previous: undefined,
      });
  });

  describe('.name', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = bindingConstraintsImplementationFixture.name;
      });

      it('should return expected result', () => {
        expect(result).toBe(internalBindingConstraintsFixture.name);
      });
    });
  });

  describe('.serviceIdentifier', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = bindingConstraintsImplementationFixture.serviceIdentifier;
      });

      it('should return expected result', () => {
        expect(result).toBe(
          internalBindingConstraintsFixture.serviceIdentifier,
        );
      });
    });
  });

  describe('.tags', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = bindingConstraintsImplementationFixture.tags;
      });

      it('should return expected result', () => {
        expect(result).toBe(internalBindingConstraintsFixture.tags);
      });
    });
  });

  describe('.getAncestors', () => {
    describe('having a bindingConstraintsImplementation with no ancestors', () => {
      let internalBindingConstraintsFixture: InternalBindingConstraints;
      let bindingConstraintsImplementationFixture: BindingConstraintsImplementation;

      beforeAll(() => {
        internalBindingConstraintsFixture = {
          name: undefined,
          serviceIdentifier: 'service-id',
          tags: new Map(),
        };
        bindingConstraintsImplementationFixture =
          new BindingConstraintsImplementation({
            elem: internalBindingConstraintsFixture,
            previous: undefined,
          });
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = bindingConstraintsImplementationFixture.getAncestor();
        });

        it('should return expected result', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a bindingConstraintsImplementation with ancestors', () => {
      let ancestorInternalBindingConstraintsFixture: InternalBindingConstraints;
      let internalBindingConstraintsFixture: InternalBindingConstraints;
      let bindingConstraintsImplementationFixture: BindingConstraintsImplementation;

      beforeAll(() => {
        ancestorInternalBindingConstraintsFixture = {
          name: 'ancestor-name',
          serviceIdentifier: 'ancestor-service-id',
          tags: new Map([['foo', 'bar']]),
        };
        internalBindingConstraintsFixture = {
          name: undefined,
          serviceIdentifier: 'service-id',
          tags: new Map(),
        };
        bindingConstraintsImplementationFixture =
          new BindingConstraintsImplementation({
            elem: internalBindingConstraintsFixture,
            previous: {
              elem: ancestorInternalBindingConstraintsFixture,
              previous: undefined,
            },
          });
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = bindingConstraintsImplementationFixture.getAncestor();
        });

        it('should return expected result', () => {
          const expected: Partial<BindingConstraints> = {
            ...ancestorInternalBindingConstraintsFixture,
            getAncestor: expect.any(Function) as unknown as () =>
              | BindingConstraints
              | undefined,
          };

          expect(result).toStrictEqual(expect.objectContaining(expected));
        });
      });
    });
  });
});
