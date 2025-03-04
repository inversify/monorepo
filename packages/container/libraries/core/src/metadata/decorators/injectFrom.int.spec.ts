import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata';

import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { inject } from './inject';
import { injectFrom } from './injectFrom';

describe(injectFrom.name, () => {
  describe('having a options with extendConstructorArguments false and extendProperties false', () => {
    let extendConstructorArguments: boolean;
    let extendProperties: boolean;

    beforeAll(() => {
      extendConstructorArguments = false;
      extendProperties = false;
    });

    describe('when called, having a source type with no metadata and a destination type with no metadata', () => {
      let destinationType: Newable;

      beforeAll(() => {
        const baseType: Newable = class {};

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {}

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return default metadata', () => {
          const expected: ClassMetadata = {
            constructorArguments: [],
            lifecycle: {
              postConstructMethodName: undefined,
              preDestroyMethodName: undefined,
            },
            properties: new Map(),
            scope: undefined,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('when called, having a source type with no metadata and a destination type with metadata', () => {
      let constructorArgumentServiceId: ServiceIdentifier;
      let propertyServiceId: ServiceIdentifier;

      let destinationType: Newable;

      beforeAll(() => {
        constructorArgumentServiceId = 'sample-param';
        propertyServiceId = 'sample-service';

        const baseType: Newable = class {};

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {
          @inject(propertyServiceId)
          public foo: unknown;

          constructor(
            @inject(constructorArgumentServiceId)
            public readonly fooParam: unknown,
          ) {}
        }

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return metadata', () => {
          const expected: ClassMetadata = {
            constructorArguments: [
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: constructorArgumentServiceId,
              },
            ],
            lifecycle: {
              postConstructMethodName: undefined,
              preDestroyMethodName: undefined,
            },
            properties: new Map([
              [
                'foo',
                {
                  kind: ClassElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: propertyServiceId,
                },
              ],
            ]),
            scope: undefined,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('when called, having a source type with metadata and a destination type with no metadata', () => {
      let destinationType: Newable;

      beforeAll(() => {
        class BaseType {
          @inject('sample-service')
          public foo: unknown;

          constructor(
            @inject('sample-param')
            public readonly fooParam: unknown,
          ) {}
        }

        const baseType: Newable = BaseType;

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {}

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return metadata', () => {
          expect(result).toStrictEqual(getDefaultClassMetadata());
        });
      });

      describe('when called, having a source type with metadata and a destination type with metadata', () => {
        let destinationType: Newable;

        beforeAll(() => {
          class BaseType {
            @inject('foo-property-base')
            public foo: unknown;

            @inject('bar-property-base')
            public bar: unknown;

            constructor(
              @inject('fooParam-param-base')
              public readonly fooParam: unknown,
              @inject('barParam-param-base')
              public readonly barParam: unknown,
            ) {}
          }

          const baseType: Newable = BaseType;

          @injectFrom({
            extendConstructorArguments: extendConstructorArguments,
            extendProperties: extendProperties,
            type: baseType,
          })
          class DestinationType {
            @inject('bar-property-child')
            public bar: unknown;

            @inject('baz-property-child')
            public baz: unknown;

            constructor(
              public readonly fooParam: unknown,
              @inject('barParam-param-child')
              public readonly barParam: unknown,
              @inject('bazParam-param-child')
              public readonly bazParam: unknown,
            ) {}
          }

          destinationType = DestinationType;
        });

        describe('when called getOwnReflectMetadata', () => {
          let result: unknown;

          beforeAll(() => {
            result = getOwnReflectMetadata(
              destinationType,
              classMetadataReflectKey,
            );
          });

          it('should return metadata', () => {
            const expectedConstructorArguments: ClassElementMetadata[] =
              new Array<ClassElementMetadata>(3);

            expectedConstructorArguments[1] = {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'barParam-param-child',
            };
            expectedConstructorArguments[2] = {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'bazParam-param-child',
            };

            const expectedBarPropertyMetadata: ClassElementMetadata = {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'bar-property-child',
            };

            const expectedBazPropertyMetadata: ClassElementMetadata = {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'baz-property-child',
            };

            const expectedClassMetadata: ClassMetadata = {
              constructorArguments: expectedConstructorArguments,
              lifecycle: {
                postConstructMethodName: undefined,
                preDestroyMethodName: undefined,
              },
              properties: new Map([
                ['bar', expectedBarPropertyMetadata],
                ['baz', expectedBazPropertyMetadata],
              ]),
              scope: undefined,
            };

            expect(result).toStrictEqual(expectedClassMetadata);
          });
        });
      });
    });
  });

  describe('having a ClassMetadataExtensionApi with extendConstructorArguments true and extendProperties true', () => {
    let extendConstructorArguments: boolean;
    let extendProperties: boolean;

    beforeAll(() => {
      extendConstructorArguments = true;
      extendProperties = true;
    });

    describe('when called, having a source type with no metadata and a destination type with no metadata', () => {
      let destinationType: Newable;

      beforeAll(() => {
        const baseType: Newable = class {};

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {}

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return default metadata', () => {
          const expected: ClassMetadata = {
            constructorArguments: [],
            lifecycle: {
              postConstructMethodName: undefined,
              preDestroyMethodName: undefined,
            },
            properties: new Map(),
            scope: undefined,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('when called, having a source type with no metadata and a destination type with metadata', () => {
      let destinationType: Newable;

      beforeAll(() => {
        const baseType: Newable = class {};

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {
          @inject('sample-service')
          public foo: unknown;

          constructor(
            @inject('sample-param')
            public readonly fooParam: unknown,
          ) {}
        }

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return metadata', () => {
          const expectedClassMetadata: ClassMetadata = {
            constructorArguments: [
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'sample-param',
              },
            ],
            lifecycle: {
              postConstructMethodName: undefined,
              preDestroyMethodName: undefined,
            },
            properties: new Map([
              [
                'foo',
                {
                  kind: ClassElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'sample-service',
                },
              ],
            ]),
            scope: undefined,
          };

          expect(result).toStrictEqual(expectedClassMetadata);
        });
      });
    });

    describe('when called, having a source type with metadata and a destination type with no metadata', () => {
      let destinationType: Newable;

      beforeAll(() => {
        class BaseType {
          @inject('sample-service')
          public foo: unknown;

          constructor(
            @inject('sample-param')
            public readonly fooParam: unknown,
          ) {}
        }

        const baseType: Newable = BaseType;

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {}

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return metadata', () => {
          const expectedClassMetadata: ClassMetadata = {
            constructorArguments: [
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'sample-param',
              },
            ],
            lifecycle: {
              postConstructMethodName: undefined,
              preDestroyMethodName: undefined,
            },
            properties: new Map([
              [
                'foo',
                {
                  kind: ClassElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'sample-service',
                },
              ],
            ]),
            scope: undefined,
          };

          expect(result).toStrictEqual(expectedClassMetadata);
        });
      });
    });

    describe('when called, having a source type with metadata and a destination type with metadata', () => {
      let destinationType: Newable;

      beforeAll(() => {
        class BaseType {
          @inject('foo-property-base')
          public foo: unknown;

          @inject('bar-property-base')
          public bar: unknown;

          constructor(
            @inject('fooParam-param-base')
            public readonly fooParam: unknown,
            @inject('barParam-param-base')
            public readonly barParam: unknown,
          ) {}
        }

        const baseType: Newable = BaseType;

        @injectFrom({
          extendConstructorArguments: extendConstructorArguments,
          extendProperties: extendProperties,
          type: baseType,
        })
        class DestinationType {
          @inject('bar-property-child')
          public bar: unknown;

          @inject('baz-property-child')
          public baz: unknown;

          constructor(
            public readonly fooParam: unknown,
            @inject('barParam-param-child')
            public readonly barParam: unknown,
            @inject('bazParam-param-child')
            public readonly bazParam: unknown,
          ) {}
        }

        destinationType = DestinationType;
      });

      describe('when called getOwnReflectMetadata', () => {
        let result: unknown;

        beforeAll(() => {
          result = getOwnReflectMetadata(
            destinationType,
            classMetadataReflectKey,
          );
        });

        it('should return metadata', () => {
          const expectedClassMetadata: ClassMetadata = {
            constructorArguments: [
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'fooParam-param-base',
              },
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'barParam-param-child',
              },
              {
                kind: ClassElementMetadataKind.singleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'bazParam-param-child',
              },
            ],
            lifecycle: {
              postConstructMethodName: undefined,
              preDestroyMethodName: undefined,
            },
            properties: new Map([
              [
                'foo',
                {
                  kind: ClassElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'foo-property-base',
                },
              ],
              [
                'bar',
                {
                  kind: ClassElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'bar-property-child',
                },
              ],
              [
                'baz',
                {
                  kind: ClassElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'baz-property-child',
                },
              ],
            ]),
            scope: undefined,
          };

          expect(result).toStrictEqual(expectedClassMetadata);
        });
      });
    });
  });
});
