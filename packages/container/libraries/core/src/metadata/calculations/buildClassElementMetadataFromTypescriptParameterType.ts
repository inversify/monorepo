import { type Newable } from '@inversifyjs/common';

import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';

export function buildClassElementMetadataFromTypescriptParameterType(
  type: Newable,
): ClassElementMetadata {
  return {
    isFromTypescriptParamType: true,
    kind: ClassElementMetadataKind.singleInjection,
    name: undefined,
    optional: false,
    tags: new Map(),
    value: type,
  };
}
