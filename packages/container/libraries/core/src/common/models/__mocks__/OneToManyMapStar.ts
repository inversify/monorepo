import { jest } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cloneMock: jest.Mock<any> = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMock: jest.Mock<any> = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllKeysMock: jest.Mock<any> = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeByRelationMock: jest.Mock<any> = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setMock: jest.Mock<any> = jest.fn();

export class OneToManyMapStar<TModel, TRelation extends object> {
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

  public readonly set: (model: TModel, relation: TRelation) => void;

  constructor() {
    this.clone = cloneMock;
    this.get = getMock;
    this.getAllKeys = getAllKeysMock;
    this.removeByRelation = removeByRelationMock;
    this.set = setMock;
  }
}
