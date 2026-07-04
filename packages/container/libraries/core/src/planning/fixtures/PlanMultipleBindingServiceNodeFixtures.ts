import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';

const defaultResolve: (params: ResolutionParams) => unknown = (): undefined =>
  undefined;

export class PlanMultipleBindingServiceNodeFixtures {
  public static get any(): PlanServiceNode {
    const fixture: PlanServiceNode = {
      bindings: [],
      isContextFree: true,
      resolve: defaultResolve,
      serviceIdentifier: 'service-id',
    };

    return fixture;
  }

  public static get withBindingsEmptyArray(): PlanServiceNode {
    const fixture: PlanServiceNode = {
      ...PlanMultipleBindingServiceNodeFixtures.any,
      bindings: [],
    };

    return fixture;
  }

  public static get withBindingsEmptyArrayAndIsContextFreeFalse(): PlanServiceNode {
    const fixture: PlanServiceNode = {
      ...PlanMultipleBindingServiceNodeFixtures.any,
      bindings: [],
      isContextFree: false,
    };

    return fixture;
  }
}
