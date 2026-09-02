import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonSchema } from '@inversifyjs/json-schema-types/2020-12';

import { collectNamedComponentSchemas } from './collectNamedComponentSchemas.js';

describe(collectNamedComponentSchemas, () => {
  describe('having undefined schemas', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedComponentSchemas(undefined);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having an untitled object schema', () => {
    let schemasFixture: Record<string, JsonSchema>;

    beforeAll(() => {
      schemasFixture = {
        User: {
          type: 'string',
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedComponentSchemas(schemasFixture);
      });

      it('should set the title from the component key', () => {
        expect(result).toStrictEqual([
          {
            title: 'User',
            type: 'string',
          },
        ]);
      });

      it('should mutate the original schema', () => {
        expect(schemasFixture['User']).toStrictEqual({
          title: 'User',
          type: 'string',
        });
      });
    });
  });

  describe('having a titled object schema', () => {
    let schemasFixture: Record<string, JsonSchema>;

    beforeAll(() => {
      schemasFixture = {
        User: {
          title: 'Person',
          type: 'string',
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedComponentSchemas(schemasFixture);
      });

      it('should keep the schema title', () => {
        expect(result).toStrictEqual([
          {
            title: 'Person',
            type: 'string',
          },
        ]);
      });
    });
  });

  describe('having boolean schemas', () => {
    let schemasFixture: Record<string, JsonSchema>;

    beforeAll(() => {
      schemasFixture = {
        Allowed: true,
        Denied: false,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedComponentSchemas(schemasFixture);
      });

      it('should wrap boolean schemas with the component key as title', () => {
        expect(result).toStrictEqual([
          {
            allOf: [true],
            title: 'Allowed',
          },
          {
            allOf: [false],
            title: 'Denied',
          },
        ]);
      });

      it('should replace the boolean schemas in the original record', () => {
        expect(schemasFixture['Allowed']).toBe((result as JsonSchema[])[0]);
        expect(schemasFixture['Denied']).toBe((result as JsonSchema[])[1]);
      });
    });
  });

  describe('having a null schema', () => {
    let schemasFixture: Record<string, JsonSchema>;

    beforeAll(() => {
      schemasFixture = {
        Invalid: null as unknown as JsonSchema,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedComponentSchemas(schemasFixture);
      });

      it('should wrap the schema with the component key as title', () => {
        expect(result).toStrictEqual([
          {
            title: 'Invalid',
          },
        ]);
      });

      it('should replace the null schema in the original record', () => {
        expect(schemasFixture['Invalid']).toBe((result as JsonSchema[])[0]);
      });
    });
  });

  describe('having an array schema', () => {
    let schemasFixture: Record<string, JsonSchema>;

    beforeAll(() => {
      schemasFixture = {
        Invalid: [] as unknown as JsonSchema,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedComponentSchemas(schemasFixture);
      });

      it('should wrap the schema with the component key as title', () => {
        expect(result).toStrictEqual([
          {
            title: 'Invalid',
          },
        ]);
      });

      it('should replace the array schema in the original record', () => {
        expect(schemasFixture['Invalid']).toBe((result as JsonSchema[])[0]);
      });
    });
  });
});
