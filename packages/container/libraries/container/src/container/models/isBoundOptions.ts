import { GetOptionsTagConstraint, MetadataName } from '@inversifyjs/core';

export interface IsBoundOptions {
  name?: MetadataName;
  tag?: GetOptionsTagConstraint;
}
