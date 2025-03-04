import { Mock, vitest } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addMock: Mock<any> = vitest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cloneMock: Mock<any> = vitest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMock: Mock<any> = vitest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllKeysMock: Mock<any> = vitest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeByRelationMock: Mock<any> = vitest.fn();

export class OneToManyMapStar<TModel, TRelation extends object> {
  public readonly add: (model: TModel, relation: TRelation) => void;
  public readonly clone: () => OneToManyMapStar<TModel, TRelation>;
  public readonly get: <TKey extends keyof TRelation>(
    key: TKey,
    value: Required<TRelation>[TKey],
  ) => Iterable<TModel> | undefined;

  public readonly getAllKeys: <TKey extends keyof TRelation>(
    key: TKey,
  ) => Iterable<TRelation[TKey]>;

  public readonly removeByRelation: <TKey extends keyof TRelation>(
    key: TKey,
    value: Required<TRelation>[TKey],
  ) => void;

  constructor() {
    this.add = addMock;
    this.clone = cloneMock;
    this.get = getMock;
    this.getAllKeys = getAllKeysMock;
    this.removeByRelation = removeByRelationMock;
  }
}
