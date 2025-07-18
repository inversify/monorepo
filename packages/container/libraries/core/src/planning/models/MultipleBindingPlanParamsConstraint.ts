import { ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from '../../metadata/models/MetadataName';
import { PlanParamsTagConstraint } from './PlanParamsTagConstraint';

export interface MultipleBindingPlanParamsConstraint {
  chained: boolean;
  name?: MetadataName;
  isMultiple: true;
  isOptional?: true;
  serviceIdentifier: ServiceIdentifier;
  tag?: PlanParamsTagConstraint;
}
