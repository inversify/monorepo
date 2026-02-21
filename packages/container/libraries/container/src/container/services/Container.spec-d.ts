import {
  beforeAll,
  describe,
  expectTypeOf,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Container } from './Container.js';

describe('BindToFluentSyntax', () => {
  let containerMock: Mocked<Container>;

  beforeAll(() => {
    containerMock = {
      get: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;
  });

  describe('.get', () => {
    describe('having a ServiceIdentifier<T>', () => {
      class Foo {}

      let serviceIdentifierFixture: ServiceIdentifier<Foo>;

      beforeAll(() => {
        serviceIdentifierFixture = Symbol();
      });

      it('should return infer T when called with ServiceIdentifier<T>', () => {
        expectTypeOf(
          containerMock.get(serviceIdentifierFixture),
        ).toEqualTypeOf<Foo>();
      });

      it('should return infer T when called with generic T', () => {
        expectTypeOf(containerMock.get<Foo>(Symbol())).toEqualTypeOf<Foo>();
      });
    });
  });
});
