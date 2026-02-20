import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type PlanParamsTagConstraint } from './PlanParamsTagConstraint.js';

export interface SingleBindingPlanParamsConstraint {
  name?: MetadataName;
  isMultiple: false;
  isOptional?: true;
  serviceIdentifier: ServiceIdentifier;
  tag?: PlanParamsTagConstraint;
}
