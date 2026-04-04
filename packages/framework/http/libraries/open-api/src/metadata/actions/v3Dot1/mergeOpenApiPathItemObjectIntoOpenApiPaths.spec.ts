import { beforeAll, describe, expect, it } from 'vitest';

import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { mergeOpenApiPathItemObjectIntoOpenApiPaths } from './mergeOpenApiPathItemObjectIntoOpenApiPaths.js';

class OpenApi3Dot1ObjectFixtures {
  public static get withNoPaths(): OpenApi3Dot1Object {
    return {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
    };
  }

  public static get withEmptyPaths(): OpenApi3Dot1Object {
    return {
      ...OpenApi3Dot1ObjectFixtures.withNoPaths,
      paths: {},
    };
  }

  public static get withExistingPathEntry(): OpenApi3Dot1Object {
    return {
      ...OpenApi3Dot1ObjectFixtures.withNoPaths,
      paths: { '/path': { get: { summary: 'summary' } } },
    };
  }

  public static get withOverlappingMethods(): OpenApi3Dot1Object {
    return {
      ...OpenApi3Dot1ObjectFixtures.withNoPaths,
      paths: {
        '/path': {
          get: {
            description: 'description',
            summary: 'summary',
          },
        },
      },
    };
  }

  public static get withArrayTags(): OpenApi3Dot1Object {
    return {
      ...OpenApi3Dot1ObjectFixtures.withNoPaths,
      paths: {
        '/path': {
          get: {
            tags: ['tag1', 'tag2'],
          },
        },
      },
    };
  }

  public static get withNestedResponses(): OpenApi3Dot1Object {
    return {
      ...OpenApi3Dot1ObjectFixtures.withNoPaths,
      paths: {
        '/path': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
                description: 'Success',
              },
            },
          },
        },
      },
    };
  }

  public static get withMixedArrayAndObjectOperations(): OpenApi3Dot1Object {
    return {
      ...OpenApi3Dot1ObjectFixtures.withNoPaths,
      paths: {
        '/path': {
          get: {
            parameters: [
              {
                in: 'path',
                name: 'id',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
              },
            },
            tags: ['existing'],
          },
        },
      },
    };
  }
}

describe(mergeOpenApiPathItemObjectIntoOpenApiPaths, () => {
  describe('.mergeOpenApiPathItemObjectIntoOpenApiPaths', () => {
    describe('having an OpenApi3Dot1Object with no paths', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withNoPaths,
            '/path',
            { get: {} },
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: { '/path': { get: {} } },
          });
        });
      });
    });

    describe('having an OpenApi3Dot1Object with empty paths', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withEmptyPaths,
            '/path',
            { get: {} },
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: { '/path': { get: {} } },
          });
        });
      });
    });

    describe('having an OpenApi3Dot1Object with existing path entry', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withExistingPathEntry,
            '/path',
            { post: {} },
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: { '/path': { get: { summary: 'summary' }, post: {} } },
          });
        });
      });
    });

    describe('having an OpenApi3Dot1Object with overlapping methods', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const pathItemObjectFixture: OpenApi3Dot1PathItemObject = {
            get: {
              description: 'new description',
            },
            post: {},
          };

          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withOverlappingMethods,
            '/path',
            pathItemObjectFixture,
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: {
              '/path': {
                get: {
                  description: 'new description',
                  summary: 'summary',
                },
                post: {},
              },
            },
          });
        });
      });
    });

    describe('having an OpenApi3Dot1Object with array merging (tags)', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withArrayTags,
            '/path',
            {
              get: {
                tags: ['tag3', 'tag4'],
              },
            },
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: {
              '/path': {
                get: {
                  tags: ['tag1', 'tag2', 'tag3', 'tag4'],
                },
              },
            },
          });
        });
      });
    });

    describe('having an OpenApi3Dot1Object with nested object merging', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withNestedResponses,
            '/path',
            {
              get: {
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        schema: {
                          properties: {
                            id: { type: 'string' },
                          },
                          type: 'object',
                        },
                      },
                      'application/xml': {
                        schema: {
                          type: 'string',
                        },
                      },
                    },
                    description: 'Success with extended content',
                  },
                  '400': {
                    description: 'Bad Request',
                  },
                },
              },
            },
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: {
              '/path': {
                get: {
                  responses: {
                    '200': {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              id: { type: 'string' },
                            },
                            type: 'object',
                          },
                        },
                        'application/xml': {
                          schema: {
                            type: 'string',
                          },
                        },
                      },
                      description: 'Success with extended content',
                    },
                    '400': {
                      description: 'Bad Request',
                    },
                  },
                },
              },
            },
          });
        });
      });
    });

    describe('having an OpenApi3Dot1Object with mixed array and object operations', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
            OpenApi3Dot1ObjectFixtures.withMixedArrayAndObjectOperations,
            '/path',
            {
              get: {
                parameters: [
                  {
                    in: 'query',
                    name: 'filter',
                    required: false,
                    schema: { type: 'string' },
                  },
                ],
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        schema: { type: 'object' },
                      },
                    },
                    description: 'Success with content',
                  },
                  '404': {
                    description: 'Not Found',
                  },
                },
                tags: ['new1', 'new2'],
              },
            },
          );
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual({
            info: {
              title: 'My awesome API',
              version: '1.0.0',
            },
            openapi: '3.1.0',
            paths: {
              '/path': {
                get: {
                  parameters: [
                    {
                      in: 'path',
                      name: 'id',
                      required: true,
                      schema: { type: 'string' },
                    },
                    {
                      in: 'query',
                      name: 'filter',
                      required: false,
                      schema: { type: 'string' },
                    },
                  ],
                  responses: {
                    '200': {
                      content: {
                        'application/json': {
                          schema: { type: 'object' },
                        },
                      },
                      description: 'Success with content',
                    },
                    '404': {
                      description: 'Not Found',
                    },
                  },
                  tags: ['existing', 'new1', 'new2'],
                },
              },
            },
          });
        });
      });
    });
  });
});
