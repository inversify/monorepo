import { beforeAll, describe, expect, it } from 'vitest';

import { type BindingConstraints } from './BindingConstraints.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from './BindingConstraintsImplementation.js';

describe(BindingConstraintsImplementation, () => {
  let internalBindingConstraintsFixture: InternalBindingConstraints;
  let bindingConstraintsImplementationFixture: BindingConstraintsImplementation;

  beforeAll(() => {
    internalBindingConstraintsFixture = {
      getAncestorsCalled: false,
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

  describe('', () => {
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
          getAncestorsCalled: false,
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

        it('should set getAncestorsCalled to true', () => {
          expect(internalBindingConstraintsFixture.getAncestorsCalled).toBe(
            true,
          );
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
          getAncestorsCalled: false,
          name: 'ancestor-name',
          serviceIdentifier: 'ancestor-service-id',
          tags: new Map([['foo', 'bar']]),
        };
        internalBindingConstraintsFixture = {
          getAncestorsCalled: false,
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
            getAncestor: expect.any(Function) as unknown as () =>
              | BindingConstraints
              | undefined,
            name: ancestorInternalBindingConstraintsFixture.name,
            serviceIdentifier:
              ancestorInternalBindingConstraintsFixture.serviceIdentifier,
            tags: ancestorInternalBindingConstraintsFixture.tags,
          };

          expect(result).toStrictEqual(expect.objectContaining(expected));
        });
      });
    });
  });
});
