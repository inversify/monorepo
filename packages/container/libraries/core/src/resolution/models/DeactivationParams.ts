import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type BindingDeactivation } from '../../binding/models/BindingDeactivation.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';

export interface DeactivationParams {
  getBindings: <TInstance>(
    serviceIdentifier: ServiceIdentifier<TInstance>,
  ) => Iterable<Binding<TInstance>> | undefined;
  getBindingsFromModule: <TInstance>(
    moduleId: number,
  ) => Iterable<Binding<TInstance>> | undefined;
  getClassMetadata: (type: Newable) => ClassMetadata;
  getDeactivations: <TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ) => Iterable<BindingDeactivation<TActivated>> | undefined;
}
