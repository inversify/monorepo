import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class Express4BasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.express4,
      'BasicGetScenario.ts',
      'express4/setupBasicGetScenario.js',
    );
  }
}
