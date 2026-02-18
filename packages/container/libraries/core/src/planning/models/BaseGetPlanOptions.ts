import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type GetPlanOptionsTagConstraint } from './GetPlanOptionsTagConstraint.js';

export interface BaseGetPlanOptions {
  serviceIdentifier: ServiceIdentifier;
  name: MetadataName | undefined;
  optional: boolean;
  tag: GetPlanOptionsTagConstraint | undefined;
}
