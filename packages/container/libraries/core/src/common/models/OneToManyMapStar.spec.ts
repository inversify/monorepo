import { beforeAll, describe, expect, it } from '@jest/globals';

import { OneToManyMapStar } from './OneToManyMapStar';

enum RelationKey {
  bar = 'bar',
  foo = 'foo',
}

interface RelationTest {
  [RelationKey.bar]?: number;
  [RelationKey.foo]: string;
}

describe(OneToManyMapStar.name, () => {
  describe('.get', () => {
    describe('having a OneToManyMapStartSpec with model', () => {
      let modelFixture: unknown;
      let relationKeyFixture: RelationKey.foo;
      let relationValueFixture: string;

      let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

      beforeAll(() => {
        modelFixture = Symbol();
        relationKeyFixture = RelationKey.foo;
        relationValueFixture = 'value-fixture';

        oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
          bar: {
            isOptional: true,
          },
          foo: {
            isOptional: false,
          },
        });

        oneToManyMapStar.set(modelFixture, {
          [relationKeyFixture]: relationValueFixture,
        });
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = [
            ...(oneToManyMapStar.get(
              relationKeyFixture,
              relationValueFixture,
            ) ?? []),
          ];
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual([modelFixture]);
        });
      });
    });

    describe('having a OneToManyMapStart with no model', () => {
      let relationKeyFixture: RelationKey.foo;
      let relationValueFixture: string;

      let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

      beforeAll(() => {
        relationKeyFixture = RelationKey.foo;
        relationValueFixture = 'value-fixture';

        oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
          bar: {
            isOptional: true,
          },
          foo: {
            isOptional: false,
          },
        });
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = oneToManyMapStar.get(
            relationKeyFixture,
            relationValueFixture,
          );
        });

        it('should return expected result', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.removeByRelation', () => {
    describe('having a OneToManyMapStart with a no models', () => {
      let relationFixture: Required<RelationTest>;
      let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

      beforeAll(() => {
        relationFixture = {
          bar: 3,
          foo: 'foo',
        };
        oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
          bar: {
            isOptional: true,
          },
          foo: {
            isOptional: false,
          },
        });
      });

      describe('when called', () => {
        beforeAll(() => {
          oneToManyMapStar.removeByRelation(
            RelationKey.bar,
            relationFixture[RelationKey.bar],
          );
        });

        describe('when called .get()', () => {
          let results: {
            [TKey in RelationKey]-?: Iterable<unknown> | undefined;
          };

          beforeAll(() => {
            results = {
              [RelationKey.bar]: oneToManyMapStar.get(
                RelationKey.bar,
                relationFixture[RelationKey.bar],
              ),
              [RelationKey.foo]: oneToManyMapStar.get(
                RelationKey.foo,
                relationFixture[RelationKey.foo],
              ),
            };
          });

          it('should return expected results', () => {
            const expectedResults: {
              [TKey in RelationKey]-?: Iterable<unknown> | undefined;
            } = {
              [RelationKey.bar]: undefined,
              [RelationKey.foo]: undefined,
            };

            expect(results).toStrictEqual(expectedResults);
          });
        });
      });
    });

    describe('having a OneToManyMapStart with a single model with each relation', () => {
      let modelFixture: unknown;
      let relationFixture: Required<RelationTest>;
      let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

      beforeAll(() => {
        modelFixture = Symbol();
        relationFixture = {
          bar: 3,
          foo: 'foo',
        };
        oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
          bar: {
            isOptional: true,
          },
          foo: {
            isOptional: false,
          },
        });

        oneToManyMapStar.set(modelFixture, relationFixture);
      });

      describe('when called', () => {
        beforeAll(() => {
          oneToManyMapStar.removeByRelation(
            RelationKey.bar,
            relationFixture[RelationKey.bar],
          );
        });

        describe('when called .get()', () => {
          let results: {
            [TKey in RelationKey]-?: Iterable<unknown> | undefined;
          };

          beforeAll(() => {
            results = {
              [RelationKey.bar]: oneToManyMapStar.get(
                RelationKey.bar,
                relationFixture[RelationKey.bar],
              ),
              [RelationKey.foo]: oneToManyMapStar.get(
                RelationKey.foo,
                relationFixture[RelationKey.foo],
              ),
            };
          });

          it('should return expected results', () => {
            const expectedResults: {
              [TKey in RelationKey]-?: Iterable<unknown> | undefined;
            } = {
              [RelationKey.bar]: undefined,
              [RelationKey.foo]: undefined,
            };

            expect(results).toStrictEqual(expectedResults);
          });
        });
      });
    });
  });

  describe('.set', () => {
    let modelFixture: unknown;
    let relationFixture: Required<RelationTest>;
    let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

    beforeAll(() => {
      modelFixture = Symbol();
      relationFixture = {
        bar: 3,
        foo: 'foo',
      };
      oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
        bar: {
          isOptional: true,
        },
        foo: {
          isOptional: false,
        },
      });
    });

    describe('when called', () => {
      beforeAll(() => {
        oneToManyMapStar.set(modelFixture, relationFixture);
      });

      describe('when called .get() with relation values', () => {
        let results: {
          [TKey in RelationKey]-?: unknown[];
        };

        beforeAll(() => {
          results = {
            [RelationKey.bar]: [
              ...(oneToManyMapStar.get(
                RelationKey.bar,
                relationFixture[RelationKey.bar],
              ) ?? []),
            ],
            [RelationKey.foo]: [
              ...(oneToManyMapStar.get(
                RelationKey.foo,
                relationFixture[RelationKey.foo],
              ) ?? []),
            ],
          };
        });

        it('should return expected results', () => {
          const expected: {
            [TKey in RelationKey]-?: unknown[];
          } = {
            [RelationKey.bar]: [modelFixture],
            [RelationKey.foo]: [modelFixture],
          };

          expect(results).toStrictEqual(expected);
        });
      });
    });
  });
});
