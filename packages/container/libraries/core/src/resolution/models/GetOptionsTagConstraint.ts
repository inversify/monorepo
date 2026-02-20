import { type MetadataTag } from '../../metadata/models/MetadataTag.js';

export interface GetOptionsTagConstraint {
  key: MetadataTag;
  value: unknown;
}
