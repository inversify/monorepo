import { type JsonRootSchemaObject } from '@inversifyjs/json-schema-types/2020-12';

export class JsonRootSchemaFixtures {
  public static get any(): JsonRootSchemaObject {
    return {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
    };
  }

  public static get withId(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      $id: 'https://schema.id',
    };
  }

  public static get withRef(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      $ref: 'https://schema.id',
    };
  }

  public static get withNoId(): JsonRootSchemaObject {
    const fixture: JsonRootSchemaObject = JsonRootSchemaFixtures.any;

    delete fixture.$id;

    return fixture;
  }

  public static get with$DefsOne(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      $defs: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withAdditionalProperties(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      additionalProperties: { $ref: 'other.json' },
    };
  }

  public static get withAllOfTwo(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      allOf: [{ maximum: 30 }, { minimum: 20 }],
    };
  }

  public static get withAnyOfTwo(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      anyOf: [{ maximum: 30 }, { minimum: 20 }],
    };
  }

  public static get withContains(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      contains: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withDependentSchemasOne(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      dependentSchemas: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withElse(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      else: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withIf(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      if: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withItems(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      items: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withNot(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      not: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withOneOfTwo(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      oneOf: [{ maximum: 20 }, { minimum: 30 }],
    };
  }

  public static get withPatternProperiesOne(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      patternProperties: {
        '^[a-z0-9]+$': {
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withPrefixItemsOne(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      prefixItems: [
        {
          enabledToggle: {
            default: null,
            description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
            title: 'Enabled',
            type: ['boolean', 'null'],
          },
        },
      ],
    };
  }

  public static get withProperiesOne(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      properties: {
        z39: {
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withProperyNames(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      propertyNames: { maxLength: 3 },
    };
  }

  public static get withThen(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      then: {
        enabledToggle: {
          default: null,
          description: `Whether the feature is enabled (true),
disabled (false), or under
automatic control (null)`,
          title: 'Enabled',
          type: ['boolean', 'null'],
        },
      },
    };
  }

  public static get withUnevaluatedItems(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      unevaluatedItems: { maxLength: 3 },
    };
  }

  public static get withUnevaluatedProperties(): JsonRootSchemaObject {
    return {
      ...JsonRootSchemaFixtures.any,
      unevaluatedProperties: { maxLength: 3 },
    };
  }
}
