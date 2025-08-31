import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class CurrentInversifyExpress4BasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.currentInversifyExpress4,
      'BasicGetScenario.ts',
      'currentInversifyExpress4/setupBasicGetScenario.js',
    );
  }
}
