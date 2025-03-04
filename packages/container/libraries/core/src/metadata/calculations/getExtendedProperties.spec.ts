import { beforeAll, describe, expect, it } from 'vitest';

import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { InjectFromOptions } from '../models/InjectFromOptions';
import { getExtendedProperties } from './getExtendedProperties';

describe(getExtendedProperties.name, () => {
  describe('having options with no extendProperties', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        properties: new Map([
          [
            'property-1',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'base-service-identifier-1',
            },
          ],
          [
            'property-2',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'base-service-identifier-2',
            },
          ],
        ]),
      };
      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        properties: new Map([
          [
            'property-1',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'service-identifier-1',
            },
          ],
        ]),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getExtendedProperties(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata', () => {
        expect(result).toStrictEqual(
          new Map([
            [
              'property-1',
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'service-identifier-1',
              },
            ],
            [
              'property-2',
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'base-service-identifier-2',
              },
            ],
          ]),
        );
      });
    });
  });

  describe('having options with extendProperties true', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        extendProperties: true,
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        properties: new Map([
          [
            'property-1',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'base-service-identifier-1',
            },
          ],
          [
            'property-2',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'base-service-identifier-2',
            },
          ],
        ]),
      };
      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        properties: new Map([
          [
            'property-1',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'service-identifier-1',
            },
          ],
        ]),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getExtendedProperties(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata', () => {
        expect(result).toStrictEqual(
          new Map([
            [
              'property-1',
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'service-identifier-1',
              },
            ],
            [
              'property-2',
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'base-service-identifier-2',
              },
            ],
          ]),
        );
      });
    });
  });

  describe('having options with extendProperties false', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        extendProperties: false,
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        properties: new Map([
          [
            'property-1',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'base-service-identifier-1',
            },
          ],
          [
            'property-2',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'base-service-identifier-2',
            },
          ],
        ]),
      };
      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        properties: new Map([
          [
            'property-1',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'service-identifier-1',
            },
          ],
        ]),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getExtendedProperties(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata', () => {
        expect(result).toBe(typeMetadataFixture.properties);
      });
    });
  });
});
