import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class UwebsocketsBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.uwebsockets,
      'BasicGetScenario.ts',
      'uwebsockets/setupBasicGetScenario.js',
    );
  }
}
