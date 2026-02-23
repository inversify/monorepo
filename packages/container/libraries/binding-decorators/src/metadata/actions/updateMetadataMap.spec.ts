import { beforeAll, describe, expect, it } from 'vitest';

import { type Newable } from 'inversify';

import { type BindingMetadata } from '../models/BindingMetadata.js';
import { type BindingMetadataMap } from '../models/BindingMetadataMap.js';
import { updateMetadataMap } from './updateMetadataMap.js';

describe(updateMetadataMap, () => {
  describe('having empty bindingMetadataMap', () => {
    let bindingMetadataFixture: BindingMetadata<unknown>;
    let bindingMetadataMapFixture: BindingMetadataMap;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;

    beforeAll(() => {
      targetFixture = class {};
      bindingMetadataFixture = {
        action: () => undefined,
        serviceIdentifier: Symbol.for('serviceIdentifier'),
      };
      bindingMetadataMapFixture = new Map();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateMetadataMap(
          targetFixture,
          bindingMetadataFixture,
        )(bindingMetadataMapFixture);
      });

      it('should return a Map with one element', () => {
        expect(result).toStrictEqual(
          new Map([[targetFixture, [bindingMetadataFixture]]]),
        );
      });
    });
  });

  describe('having bindingMetadataMap with existing target bindings', () => {
    let bindingMetadataFixture: BindingMetadata<unknown>;
    let bindingMetadataMapFixture: BindingMetadataMap;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;

    beforeAll(() => {
      targetFixture = class {};
      bindingMetadataFixture = {
        action: () => undefined,
        serviceIdentifier: Symbol.for('serviceIdentifier'),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bindingMetadataMapFixture = new Map<Newable, BindingMetadata<any>[]>([
        [targetFixture as Newable, [bindingMetadataFixture]],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateMetadataMap(
          targetFixture,
          bindingMetadataFixture,
        )(bindingMetadataMapFixture);
      });

      it('should return a Map with one element', () => {
        expect(result).toStrictEqual(
          new Map([
            [targetFixture, [bindingMetadataFixture, bindingMetadataFixture]],
          ]),
        );
      });
    });
  });
});
