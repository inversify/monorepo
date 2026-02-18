import { type GetPlanOptions } from '../models/GetPlanOptions.js';

export class GetPlanOptionsFixtures {
  public static get any(): GetPlanOptions {
    const fixture: GetPlanOptions = {
      isMultiple: false,
      name: 'any',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'tag-key',
        value: 'tag-value',
      },
    };

    return fixture;
  }
}
