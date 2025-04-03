import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class CurrentInversifyFastifyBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.currentInversifyFastify,
      'BasicGetScenario.ts',
      'currentInversifyFastify/setupBasicGetScenario.js',
    );
  }
}
