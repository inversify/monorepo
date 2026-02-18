import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type GetOptionsTagConstraint } from './GetOptionsTagConstraint.js';

export interface GetOptions {
  autobind?: boolean;
  name?: MetadataName;
  optional?: boolean;
  tag?: GetOptionsTagConstraint;
}
