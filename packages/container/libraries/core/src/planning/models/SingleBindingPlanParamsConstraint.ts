import { ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from '../../metadata/models/MetadataName';
import { PlanParamsTagConstraint } from './PlanParamsTagConstraint';

export interface SingleBindingPlanParamsConstraint {
  name?: MetadataName;
  isMultiple: false;
  isOptional?: true;
  serviceIdentifier: ServiceIdentifier;
  tag?: PlanParamsTagConstraint;
}
