import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('./BaseOasSchemaProperty.js'));

import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type BuildOpenApiBlockFunction } from '../../models/v3Dot1/BuildOpenApiBlockFunction.js';
import { BaseOasSchemaProperty } from './BaseOasSchemaProperty.js';
import { OasSchemaOptionalProperty } from './OasSchemaOptionalProperty.js';

describe(OasSchemaOptionalProperty, () => {
  describe('when called', () => {
    let propertyDecoratorFixture: PropertyDecorator;
    let schemaFixture: OpenApi3Dot1SchemaObject | undefined;
    let buildPropertyDecoratorMock: Mock<
      (
        schema?:
          | OpenApi3Dot1SchemaObject
          | BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>,
      ) => PropertyDecorator
    >;

    let result: unknown;

    beforeAll(() => {
      propertyDecoratorFixture = Symbol() as unknown as PropertyDecorator;
      schemaFixture = {
        type: 'string',
      };

      buildPropertyDecoratorMock = vitest
        .fn()
        .mockReturnValueOnce(propertyDecoratorFixture);

      vitest
        .mocked(BaseOasSchemaProperty)
        .mockReturnValueOnce(buildPropertyDecoratorMock);

      result = OasSchemaOptionalProperty(schemaFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call BaseOasSchemaProperty()', () => {
      expect(BaseOasSchemaProperty).toHaveBeenCalledExactlyOnceWith(false);
    });

    it('should call the built property decorator function', () => {
      expect(buildPropertyDecoratorMock).toHaveBeenCalledExactlyOnceWith(
        schemaFixture,
      );
    });

    it('should return a property decorator', () => {
      expect(result).toBe(propertyDecoratorFixture);
    });
  });
});
