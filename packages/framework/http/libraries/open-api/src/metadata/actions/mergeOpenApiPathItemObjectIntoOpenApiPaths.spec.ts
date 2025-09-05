import { beforeAll, describe, expect, it } from 'vitest';

import {
  OpenApi3Dot1Object,
  OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { mergeOpenApiPathItemObjectIntoOpenApiPaths } from './mergeOpenApiPathItemObjectIntoOpenApiPaths';

describe.each<
  [
    string,
    OpenApi3Dot1Object,
    string,
    OpenApi3Dot1PathItemObject,
    OpenApi3Dot1Object,
  ]
>([
  [
    'empty paths',
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
    },
    '/path',
    { get: {} },
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: { '/path': { get: {} } },
    },
  ],
  [
    'empty path entry',
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {},
    },
    '/path',
    { get: {} },
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: { '/path': { get: {} } },
    },
  ],
  [
    'existing path entry',
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: { '/path': { get: { summary: 'summary' } } },
    },
    '/path',
    { post: {} },
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: { '/path': { get: { summary: 'summary' }, post: {} } },
    },
  ],
  [
    'existing path entry with overlapping methods',
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/path': {
          get: {
            description: 'description',
            summary: 'summary',
          },
        },
      },
    },
    '/path',
    {
      get: {
        description: 'new description',
      },
      post: {},
    },
    {
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
    },
  ],
  [
    'existing path entry with array merging (tags)',
    {
      info: {
        title: 'My awesome API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/path': {
          get: {
            tags: ['tag1', 'tag2'],
          },
        },
      },
    },
    '/path',
    {
      get: {
        tags: ['tag3', 'tag4'],
      },
    },
    {
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
    },
  ],
  [
    'existing path entry with nested object merging',
    {
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
    },
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
    {
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
    },
  ],
  [
    'existing path entry with mixed array and object operations',
    {
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
    },
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
    {
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
    },
  ],
])(
  'having OpenApi3Dot1Object with %s',
  (
    _: string,
    openApi3Dot1ObjectFixture: OpenApi3Dot1Object,
    pathFixture: string,
    pathItemObjectFixture: OpenApi3Dot1PathItemObject,
    expectedResult: OpenApi3Dot1Object,
  ) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = mergeOpenApiPathItemObjectIntoOpenApiPaths(
          openApi3Dot1ObjectFixture,
          pathFixture,
          pathItemObjectFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual(expectedResult);
      });
    });
  },
);
