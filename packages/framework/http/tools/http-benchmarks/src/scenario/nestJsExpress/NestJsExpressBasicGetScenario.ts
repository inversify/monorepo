import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class NestJsExpressBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.nestJsExpress,
      'BasicGetScenario.ts',
      'nestJsExpress/setupBasicGetScenario.js',
    );
  }
}
