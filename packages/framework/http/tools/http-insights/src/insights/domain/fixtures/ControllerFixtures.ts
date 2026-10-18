import { type Controller } from '../models/Controller.js';

export class ControllerFixtures {
  public static get any(): Controller {
    return {
      controller: 'FooController',
      endedAt: new Date('2026-01-01T00:00:03.000Z'),
      error: { message: 'boom' },
      id: 'controller-id',
      method: 'getFoo',
      startedAt: new Date('2026-01-01T00:00:02.000Z'),
    };
  }
}
