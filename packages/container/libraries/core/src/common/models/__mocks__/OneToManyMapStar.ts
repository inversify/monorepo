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

interface Constructable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Procedure = (...args: any[]) => any;

function castMock<
  TIn extends Constructable | Procedure,
  TOut extends Constructable | Procedure,
>(mock: Mock<TIn>): Mock<TOut> {
  return mock as unknown as Mock<TOut>;
}

export class OneToManyMapStar<TModel, TRelation extends object> {
  public readonly add: Mock<(model: TModel, relation: TRelation) => void>;
  public readonly clone: Mock<() => OneToManyMapStar<TModel, TRelation>>;
  public readonly get: Mock<
    <TKey extends keyof TRelation>(
      key: TKey,
      value: Required<TRelation>[TKey],
    ) => Iterable<TModel> | undefined
  >;

  public readonly getAllKeys: Mock<
    <TKey extends keyof TRelation>(key: TKey) => Iterable<TRelation[TKey]>
  >;

  public readonly removeByRelation: Mock<
    <TKey extends keyof TRelation>(
      key: TKey,
      value: Required<TRelation>[TKey],
    ) => void
  >;

  constructor() {
    this.add = castMock(addMock);
    this.clone = castMock(cloneMock);
    this.get = castMock(getMock);
    this.getAllKeys = castMock(getAllKeysMock);
    this.removeByRelation = castMock(removeByRelationMock);
  }
}
