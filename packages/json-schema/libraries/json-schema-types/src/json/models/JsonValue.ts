export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValueObject
  | JsonValue[];

export interface JsonValueObject {
  [key: string]: JsonValue;
}
