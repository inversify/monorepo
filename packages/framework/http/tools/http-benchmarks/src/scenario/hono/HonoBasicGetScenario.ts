import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class HonoBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.hono,
      'BasicGetScenario.ts',
      'hono/setupBasicGetScenario.js',
    );
  }
}
