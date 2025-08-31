import { beforeAll, describe, expect, it } from 'vitest';

import { JsonSchema } from '@inversifyjs/json-schema-types/2020-12';

import { tryBuildSchemaFromWellKnownType } from './tryBuildSchemaFromWellKnownType';

describe(tryBuildSchemaFromWellKnownType, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  describe.each<[string, Function, JsonSchema | undefined]>([
    ['String', String, { type: 'string' }],
    ['Number', Number, { type: 'number' }],
    ['Boolean', Boolean, { type: 'boolean' }],
    ['Object', Object, { type: 'object' }],
    ['Array', Array, { type: 'array' }],
    ['other', class {}, undefined],
  ])(
    'having %s type',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    (_: string, type: Function, expected: JsonSchema | undefined) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = tryBuildSchemaFromWellKnownType(type);
        });

        it('should return the expected schema', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
