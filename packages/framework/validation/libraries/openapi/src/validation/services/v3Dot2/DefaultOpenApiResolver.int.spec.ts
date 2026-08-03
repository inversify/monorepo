import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';

import { DefaultOpenApiResolver } from './DefaultOpenApiResolver.js';

describe(DefaultOpenApiResolver, () => {
  describe('having an OpenAPI object with schema $id references', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let defaultOpenApiResolver: DefaultOpenApiResolver;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Item: {
              $id: 'https://example.com/schemas/Item.json',
              properties: {
                label: {
                  type: 'string',
                },
              },
              required: ['label'],
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.2.0',
      };

      defaultOpenApiResolver = new DefaultOpenApiResolver(openApiObjectFixture);
    });

    describe('.resolveReference', () => {
      describe('when called with a schema $id', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.resolveReference(
            'https://example.com/schemas/Item.json',
          );
        });

        it('should return the schema identified by $id', () => {
          expect(result).toBe(
            openApiObjectFixture.components?.schemas?.['Item'],
          );
        });
      });

      describe('when called with a schema $id and a JSON pointer fragment', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.resolveReference(
            'https://example.com/schemas/Item.json#/properties/label',
          );
        });

        it('should return the schema at the JSON pointer', () => {
          expect(result).toStrictEqual({
            type: 'string',
          });
        });
      });

      describe('when called with a document JSON pointer reference', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.resolveReference(
            '#/components/schemas/Item',
          );
        });

        it('should return the schema at the document JSON pointer', () => {
          expect(result).toBe(
            openApiObjectFixture.components?.schemas?.['Item'],
          );
        });
      });

      describe('when called with an unknown reference', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.resolveReference(
            'https://example.com/schemas/Unknown.json',
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called with a reference with multiple fragments', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            defaultOpenApiResolver.resolveReference(
              'https://example.com/schemas/Item.json#foo#bar',
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect(result).toMatchObject({
            message: expect.stringContaining('at most one fragment'),
          });
        });
      });
    });
  });

  describe('having an OpenAPI object with $anchor on a schema with $id', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let defaultOpenApiResolver: DefaultOpenApiResolver;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Item: {
              $anchor: 'item',
              $id: 'https://example.com/schemas/Item.json',
              properties: {
                label: {
                  type: 'string',
                },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.2.0',
      };

      defaultOpenApiResolver = new DefaultOpenApiResolver(openApiObjectFixture);
    });

    describe('.resolveReference', () => {
      describe('when called with an $id and $anchor URI', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.resolveReference(
            'https://example.com/schemas/Item.json#item',
          );
        });

        it('should return the schema identified by the anchor URI', () => {
          expect(result).toBe(
            openApiObjectFixture.components?.schemas?.['Item'],
          );
        });
      });
    });
  });

  describe('having an OpenAPI object with a nested $anchor under a schema with $id', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let defaultOpenApiResolver: DefaultOpenApiResolver;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Item: {
              $id: 'https://example.com/schemas/Item.json',
              properties: {
                label: {
                  $anchor: 'label',
                  type: 'string',
                },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.2.0',
      };

      defaultOpenApiResolver = new DefaultOpenApiResolver(openApiObjectFixture);
    });

    describe('.resolveReference', () => {
      describe('when called with the closest ancestor $id and nested $anchor URI', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.resolveReference(
            'https://example.com/schemas/Item.json#label',
          );
        });

        it('should return the nested schema identified by the anchor URI', () => {
          expect(result).toStrictEqual({
            $anchor: 'label',
            type: 'string',
          });
        });
      });
    });
  });

  describe('having an OpenAPI object with a nested $anchor and no $id', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let defaultOpenApiResolver: DefaultOpenApiResolver;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Item: {
              properties: {
                label: {
                  $anchor: 'label',
                  type: 'string',
                },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.2.0',
      };

      defaultOpenApiResolver = new DefaultOpenApiResolver(openApiObjectFixture);
    });

    describe('.resolveReference', () => {
      describe('when called with a document-relative anchor URI', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            defaultOpenApiResolver.resolveReference('#label');
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect(result).toMatchObject({
            message: 'Invalid JSON pointer!',
          });
        });
      });
    });
  });

  describe('having an OpenAPI object with chained $ref references', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let defaultOpenApiResolver: DefaultOpenApiResolver;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Item: {
              $id: 'https://example.com/schemas/Item.json',
              properties: {
                label: {
                  type: 'string',
                },
              },
              type: 'object',
            },
            ItemRef: {
              $ref: 'https://example.com/schemas/Item.json',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.2.0',
      };

      defaultOpenApiResolver = new DefaultOpenApiResolver(openApiObjectFixture);
    });

    describe('.deepResolveReference', () => {
      describe('when called with a reference that resolves to another reference', () => {
        let result: unknown;

        beforeAll(() => {
          result = defaultOpenApiResolver.deepResolveReference(
            '#/components/schemas/ItemRef',
          );
        });

        it('should return the deeply resolved schema', () => {
          expect(result).toBe(
            openApiObjectFixture.components?.schemas?.['Item'],
          );
        });
      });
    });
  });
});
