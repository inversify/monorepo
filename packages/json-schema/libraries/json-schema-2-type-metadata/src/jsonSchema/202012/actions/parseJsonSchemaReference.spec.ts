import { beforeAll, describe, expect, it } from 'vitest';

import { type ParsedJsonSchemaReference } from '../models/ParsedJsonSchemaReference.js';
import { parseJsonSchemaReference } from './parseJsonSchemaReference.js';

describe(parseJsonSchemaReference, () => {
  describe.each<[string, Omit<ParsedJsonSchemaReference, 'value'>]>([
    ['#node', { anchor: 'node', isLocal: true }],
    ['#_node-1.0', { anchor: '_node-1.0', isLocal: true }],
    ['#', { anchor: undefined, isLocal: true }],
    ['#/$defs/node', { anchor: undefined, isLocal: true }],
    ['#0node', { anchor: undefined, isLocal: true }],
    ['#node/leaf', { anchor: undefined, isLocal: true }],
    ['https://example.com/tree', { anchor: undefined, isLocal: false }],
    ['https://example.com/tree#node', { anchor: 'node', isLocal: false }],
    [
      'https://example.com/tree#/$defs/node',
      { anchor: undefined, isLocal: false },
    ],
    ['urn:example:tree#node', { anchor: 'node', isLocal: false }],
    ['tree.json', { anchor: undefined, isLocal: false }],
  ])(
    'having a "%s" reference',
    (
      referenceFixture: string,
      expectedParsedReference: Omit<ParsedJsonSchemaReference, 'value'>,
    ) => {
      describe('when called', () => {
        let result: ParsedJsonSchemaReference;

        beforeAll(() => {
          result = parseJsonSchemaReference(referenceFixture);
        });

        it('should return expected ParsedJsonSchemaReference', () => {
          expect(result).toStrictEqual({
            ...expectedParsedReference,
            value: referenceFixture,
          });
        });
      });
    },
  );
});
