import { ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from '../../metadata/models/MetadataName';
import { GetPlanOptionsTagConstraint } from './GetPlanOptionsTagConstraint';

export interface BaseGetPlanOptions {
  serviceIdentifier: ServiceIdentifier;
  name: MetadataName | undefined;
  optional: boolean;
  tag: GetPlanOptionsTagConstraint | undefined;
}
