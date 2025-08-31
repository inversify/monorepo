import { BaseK6Scenario } from '../k6/BaseK6Scenario';
import { Platform } from '../models/Platform';

export class FastifyBasicGetScenario extends BaseK6Scenario {
  constructor() {
    super(
      Platform.fastify,
      'BasicGetScenario.ts',
      'fastify/setupBasicGetScenario.js',
    );
  }
}
