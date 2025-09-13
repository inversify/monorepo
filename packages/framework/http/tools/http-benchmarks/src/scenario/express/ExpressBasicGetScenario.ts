import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class ExpressBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.express,
      'BasicGetScenario.ts',
      'express/setupBasicGetScenario.js',
    );
  }
}
