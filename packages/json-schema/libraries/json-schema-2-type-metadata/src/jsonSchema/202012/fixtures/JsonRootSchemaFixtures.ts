import { type JsonRootSchemaObject } from '@inversifyjs/json-schema-types/2020-12';

export const STRICT_TREE_ID: string = 'https://example.com/strict-tree';
export const TREE_ID: string = 'https://example.com/tree';

export class JsonRootSchemaFixtures {
  public static get any(): JsonRootSchemaObject {
    return {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
    };
  }

  /**
   * The `tree` resource from
   * https://json-schema.org/draft/2020-12/json-schema-core.html section
   * 8.2.3.2: a recursive tree whose nodes are left extensible through
   * `$dynamicAnchor`.
   */
  public static get withUseCaseDynamicAnchorTree(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      $dynamicAnchor: 'node',
      $id: TREE_ID,
      properties: {
        children: {
          items: {
            $dynamicRef: '#node',
            type: 'object',
          },
          type: 'array',
        },
      },
      type: 'object',
    };
  }

  /**
   * The `strict-tree` resource from the same section, extending `tree` so
   * every node requires a `name`. The required property is what makes the
   * dynamic resolution observable in the resulting type.
   */
  public static get withUseCaseDynamicAnchorStrictTree(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      $dynamicAnchor: 'node',
      $id: STRICT_TREE_ID,
      $ref: TREE_ID,
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    };
  }
}
