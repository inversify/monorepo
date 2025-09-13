import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class CurrentInversifyHonoBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.currentInversifyHono,
      'BasicGetScenario.ts',
      'currentInversifyHono/setupBasicGetScenario.js',
    );
  }
}
