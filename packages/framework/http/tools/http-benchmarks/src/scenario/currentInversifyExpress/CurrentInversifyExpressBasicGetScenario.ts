import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class CurrentInversifyExpressBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.currentInversifyExpress,
      'BasicGetScenario.ts',
      'currentInversifyExpress/setupBasicGetScenario.js',
    );
  }
}
