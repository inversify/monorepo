import { beforeAll, describe, expect, it } from 'vitest';

import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../models/ClassMetadata';
import { ClassMetadataLifecycle } from '../models/ClassMetadataLifecycle';
import { InjectFromOptions } from '../models/InjectFromOptions';
import { getExtendedLifecycle } from './getExtendedLifecycle';

describe(getExtendedLifecycle, () => {
  describe('having options with no lifecycle configuration', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['basePostConstruct']),
          preDestroyMethodNames: new Set(['basePreDestroy']),
        },
      };

      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['typePostConstruct']),
          preDestroyMethodNames: new Set(['typePreDestroy']),
        },
      };
    });

    describe('when called', () => {
      let result: ClassMetadataLifecycle;

      beforeAll(() => {
        result = getExtendedLifecycle(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata with combined lifecycle methods', () => {
        expect(result).toStrictEqual({
          postConstructMethodNames: new Set([
            'basePostConstruct',
            'typePostConstruct',
          ]),
          preDestroyMethodNames: new Set(['basePreDestroy', 'typePreDestroy']),
        });
      });
    });
  });

  describe('having options with extendPostConstructMethods false', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        lifecycle: {
          extendPostConstructMethods: false,
        },
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['basePostConstruct']),
          preDestroyMethodNames: new Set(['basePreDestroy']),
        },
      };

      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['typePostConstruct']),
          preDestroyMethodNames: new Set(['typePreDestroy']),
        },
      };
    });

    describe('when called', () => {
      let result: ClassMetadataLifecycle;

      beforeAll(() => {
        result = getExtendedLifecycle(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata with only type postConstruct methods', () => {
        expect(result).toStrictEqual({
          postConstructMethodNames: new Set(['typePostConstruct']),
          preDestroyMethodNames: new Set(['basePreDestroy', 'typePreDestroy']),
        });
      });
    });
  });

  describe('having options with extendPreDestroyMethods false', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        lifecycle: {
          extendPreDestroyMethods: false,
        },
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['basePostConstruct']),
          preDestroyMethodNames: new Set(['basePreDestroy']),
        },
      };

      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['typePostConstruct']),
          preDestroyMethodNames: new Set(['typePreDestroy']),
        },
      };
    });

    describe('when called', () => {
      let result: ClassMetadataLifecycle;

      beforeAll(() => {
        result = getExtendedLifecycle(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata with only type preDestroy methods', () => {
        expect(result).toStrictEqual({
          postConstructMethodNames: new Set([
            'basePostConstruct',
            'typePostConstruct',
          ]),
          preDestroyMethodNames: new Set(['typePreDestroy']),
        });
      });
    });
  });

  describe('having options with both extendPostConstructMethods and extendPreDestroyMethods false', () => {
    let optionsFixture: InjectFromOptions;
    let baseTypeClassMetadataFixture: ClassMetadata;
    let typeMetadataFixture: ClassMetadata;

    beforeAll(() => {
      optionsFixture = {
        lifecycle: {
          extendPostConstructMethods: false,
          extendPreDestroyMethods: false,
        },
        type: class {},
      };

      baseTypeClassMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['basePostConstruct']),
          preDestroyMethodNames: new Set(['basePreDestroy']),
        },
      };

      typeMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['typePostConstruct']),
          preDestroyMethodNames: new Set(['typePreDestroy']),
        },
      };
    });

    describe('when called', () => {
      let result: ClassMetadataLifecycle;

      beforeAll(() => {
        result = getExtendedLifecycle(
          optionsFixture,
          baseTypeClassMetadataFixture,
          typeMetadataFixture,
        );
      });

      it('should return expected metadata with only type lifecycle methods', () => {
        expect(result).toStrictEqual({
          postConstructMethodNames: new Set(['typePostConstruct']),
          preDestroyMethodNames: new Set(['typePreDestroy']),
        });
      });
    });
  });
});
