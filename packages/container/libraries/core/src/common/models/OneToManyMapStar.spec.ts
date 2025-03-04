import { beforeAll, describe, expect, it } from 'vitest';

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
  describe('.clone', () => {
    let modelFixture: unknown;
    let relationFixture: Required<RelationTest>;

    let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

    beforeAll(() => {
      oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
        bar: {
          isOptional: true,
        },
        foo: {
          isOptional: false,
        },
      });

      modelFixture = Symbol();

      relationFixture = {
        [RelationKey.bar]: 2,
        [RelationKey.foo]: 'foo-value-fixture',
      };

      oneToManyMapStar.add(modelFixture, relationFixture);
    });

    describe('when called', () => {
      let modelsFromRelationResult: unknown;

      let result: unknown;

      beforeAll(() => {
        const clone: OneToManyMapStar<unknown, RelationTest> =
          oneToManyMapStar.clone();

        modelsFromRelationResult = [
          ...(clone.get(RelationKey.bar, relationFixture[RelationKey.bar]) ??
            []),
        ];

        result = clone;
      });

      it('should return a OneToManyMapStar', () => {
        expect(result).toBeInstanceOf(OneToManyMapStar);
      });

      it('should provide expected model', () => {
        expect(modelsFromRelationResult).toStrictEqual([modelFixture]);
      });
    });

    describe('when called, and a value is added', () => {
      let originalModelsFromRelationResult: unknown;
      let cloneModelsFromRelationResult: unknown;

      let result: unknown;

      beforeAll(() => {
        const clone: OneToManyMapStar<unknown, RelationTest> =
          oneToManyMapStar.clone();

        clone.add(modelFixture, relationFixture);

        cloneModelsFromRelationResult = [
          ...(clone.get(RelationKey.bar, relationFixture[RelationKey.bar]) ??
            []),
        ];

        originalModelsFromRelationResult = [
          ...(oneToManyMapStar.get(
            RelationKey.bar,
            relationFixture[RelationKey.bar],
          ) ?? []),
        ];

        result = clone;
      });

      it('should return a OneToManyMapStar', () => {
        expect(result).toBeInstanceOf(OneToManyMapStar);
      });

      it('should provide expected models from clone', () => {
        expect(cloneModelsFromRelationResult).toStrictEqual([
          modelFixture,
          modelFixture,
        ]);
      });

      it('should provide expected models from original', () => {
        expect(originalModelsFromRelationResult).toStrictEqual([modelFixture]);
      });
    });
  });

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

        oneToManyMapStar.add(modelFixture, {
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

    describe('having a OneToManyMapStartSpec with twice a model', () => {
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

        oneToManyMapStar.add(modelFixture, {
          [relationKeyFixture]: relationValueFixture,
        });

        oneToManyMapStar.add(modelFixture, {
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
          expect(result).toStrictEqual([modelFixture, modelFixture]);
        });
      });
    });
  });

  describe('.getAllKeys', () => {
    describe('having a OneToManyMapStart with a single model', () => {
      let modelFixture: unknown;
      let relationFixture: Required<RelationTest>;
      let relationKeyFixture: RelationKey.foo;
      let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

      beforeAll(() => {
        modelFixture = Symbol();
        relationFixture = {
          bar: 3,
          foo: 'foo',
        };
        relationKeyFixture = RelationKey.foo;
        oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
          bar: {
            isOptional: true,
          },
          foo: {
            isOptional: false,
          },
        });

        oneToManyMapStar.add(modelFixture, relationFixture);
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = [...oneToManyMapStar.getAllKeys(relationKeyFixture)];
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual([relationFixture[relationKeyFixture]]);
        });
      });
    });
  });

  describe('.removeByRelation', () => {
    describe('having a OneToManyMapStart with no models', () => {
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

        oneToManyMapStar.add(modelFixture, relationFixture);
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

    describe('having a OneToManyMapStart with twice a model with different relations', () => {
      let modelFixture: unknown;
      let firstRelationFixture: Required<RelationTest>;
      let secondRelationFixture: Required<RelationTest>;

      beforeAll(() => {
        modelFixture = Symbol();
        firstRelationFixture = {
          bar: 3,
          foo: 'foo',
        };
        secondRelationFixture = {
          bar: 4,
          foo: firstRelationFixture[RelationKey.foo],
        };
      });

      describe('when called, with a value asociated to a single model', () => {
        let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

        beforeAll(() => {
          oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
            bar: {
              isOptional: true,
            },
            foo: {
              isOptional: false,
            },
          });

          oneToManyMapStar.add(modelFixture, firstRelationFixture);
          oneToManyMapStar.add(modelFixture, secondRelationFixture);

          oneToManyMapStar.removeByRelation(
            RelationKey.bar,
            firstRelationFixture[RelationKey.bar],
          );
        });

        describe('when called .get()', () => {
          let results: {
            [TKey in RelationKey]-?: Iterable<unknown> | undefined;
          };

          beforeAll(() => {
            results = {
              [RelationKey.bar]: [
                ...(oneToManyMapStar.get(
                  RelationKey.bar,
                  firstRelationFixture[RelationKey.bar],
                ) ?? []),
              ],
              [RelationKey.foo]: [
                ...(oneToManyMapStar.get(
                  RelationKey.foo,
                  firstRelationFixture[RelationKey.foo],
                ) ?? []),
              ],
            };
          });

          it('should return expected results', () => {
            const expectedResults: {
              [TKey in RelationKey]-?: Iterable<unknown> | undefined;
            } = {
              [RelationKey.bar]: [],
              [RelationKey.foo]: [modelFixture],
            };

            expect(results).toStrictEqual(expectedResults);
          });
        });
      });

      describe('when called, with a value asociated to both models', () => {
        let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

        beforeAll(() => {
          oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
            bar: {
              isOptional: true,
            },
            foo: {
              isOptional: false,
            },
          });

          oneToManyMapStar.add(modelFixture, firstRelationFixture);
          oneToManyMapStar.add(modelFixture, secondRelationFixture);

          oneToManyMapStar.removeByRelation(
            RelationKey.foo,
            firstRelationFixture[RelationKey.foo],
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
                firstRelationFixture[RelationKey.bar],
              ),
              [RelationKey.foo]: oneToManyMapStar.get(
                RelationKey.foo,
                firstRelationFixture[RelationKey.foo],
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

    describe('having a OneToManyMapStart with two models with the same relation', () => {
      let firstModelFixture: unknown;
      let secondModelFixture: unknown;
      let relationFixture: Required<RelationTest>;

      beforeAll(() => {
        firstModelFixture = Symbol();
        secondModelFixture = Symbol();
        relationFixture = {
          bar: 3,
          foo: 'foo',
        };
      });

      describe('when called', () => {
        let oneToManyMapStar: OneToManyMapStar<unknown, RelationTest>;

        beforeAll(() => {
          oneToManyMapStar = new OneToManyMapStar<unknown, RelationTest>({
            bar: {
              isOptional: true,
            },
            foo: {
              isOptional: false,
            },
          });

          oneToManyMapStar.add(firstModelFixture, relationFixture);
          oneToManyMapStar.add(secondModelFixture, relationFixture);

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
        oneToManyMapStar.add(modelFixture, relationFixture);
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
