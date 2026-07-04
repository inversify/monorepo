import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';

const defaultResolve: (params: ResolutionParams) => unknown = (): undefined =>
  undefined;

export class PlanSingleBindingServiceNodeFixtures {
  public static get any(): PlanServiceNode {
    const fixture: PlanServiceNode = {
      bindings: undefined,
      isContextFree: true,
      resolve: defaultResolve,
      serviceIdentifier: 'service-id',
    };

    return fixture;
  }

  public static get withBindingsPlanBindingNode(): PlanServiceNode {
    const fixture: PlanServiceNode = {
      ...PlanSingleBindingServiceNodeFixtures.any,
      bindings: {
        resolve: defaultResolve,
      } as Partial<PlanBindingNode> as PlanBindingNode,
    };

    return fixture;
  }

  public static get withBindingsUndefined(): PlanServiceNode {
    const fixture: PlanServiceNode = {
      ...PlanSingleBindingServiceNodeFixtures.any,
      bindings: undefined,
    };

    return fixture;
  }
}
