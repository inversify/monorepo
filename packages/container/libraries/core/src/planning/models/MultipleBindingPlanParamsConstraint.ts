import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type PlanParamsTagConstraint } from './PlanParamsTagConstraint.js';

export interface MultipleBindingPlanParamsConstraint {
  chained: boolean;
  name?: MetadataName;
  isMultiple: true;
  isOptional?: true;
  serviceIdentifier: ServiceIdentifier;
  tag?: PlanParamsTagConstraint;
}
