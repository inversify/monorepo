import { type BuildMultipleBindingServiceNodeOptions } from '../models/BuildMultipleBindingServiceNodeOptions.js';

export class BuildMultipleBindingServiceNodeOptionsFixtures {
  public static get any(): BuildMultipleBindingServiceNodeOptions {
    return {
      chained: false,
      isMultiple: true,
      name: undefined,
      optional: false,
      serviceIdentifier: Symbol(),
      tags: new Map(),
    };
  }
}
