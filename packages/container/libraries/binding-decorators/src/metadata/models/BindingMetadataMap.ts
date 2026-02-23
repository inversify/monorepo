import { type Newable } from 'inversify';

import { type BindingMetadata } from './BindingMetadata.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BindingMetadataMap = Map<Newable, BindingMetadata<any>[]>;
