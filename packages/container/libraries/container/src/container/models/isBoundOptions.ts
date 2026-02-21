import {
  type GetOptionsTagConstraint,
  type MetadataName,
} from '@inversifyjs/core';

export interface IsBoundOptions {
  name?: MetadataName;
  tag?: GetOptionsTagConstraint;
}
