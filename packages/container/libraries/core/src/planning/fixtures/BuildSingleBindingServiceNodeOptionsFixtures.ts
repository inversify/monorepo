import { type BuildSingleBindingServiceNodeOptions } from '../models/BuildSingleBindingServiceNodeOptions.js';

export class BuildSingleBindingServiceNodeOptionsFixtures {
  public static get any(): BuildSingleBindingServiceNodeOptions {
    return {
      isMultiple: false,
      name: undefined,
      optional: false,
      serviceIdentifier: Symbol(),
      tags: new Map(),
    };
  }
}
