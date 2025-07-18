import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { BasePlanParamsAutobindOptions } from './BasePlanParamsAutobindOptions';

export interface BasePlanParams {
  autobindOptions: BasePlanParamsAutobindOptions | undefined;
  getBindings: <TInstance>(
    serviceIdentifier: ServiceIdentifier<TInstance>,
  ) => Iterable<Binding<TInstance>> | undefined;
  getBindingsChained: <TInstance>(
    serviceIdentifier: ServiceIdentifier<TInstance>,
  ) => Generator<Binding<TInstance>, void, unknown>;
  getClassMetadata: (type: Newable) => ClassMetadata;
  servicesBranch: ServiceIdentifier[];
  setBinding: <TInstance>(binding: Binding<TInstance>) => void;
}
