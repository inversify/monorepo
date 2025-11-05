import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class CurrentInversifyUwebsocketsBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.currentInversifyUwebsockets,
      'BasicGetScenario.ts',
      'currentInversifyUwebsockets/setupBasicGetScenario.js',
    );
  }
}
