interface PlanJsonObject {
  readonly [key: string]: PlanJsonValue;
}

export type PlanJsonValue =
  | boolean
  | number
  | string
  | null
  | PlanJsonObject
  | readonly PlanJsonValue[];
