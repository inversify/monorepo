import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { BindingDeactivation } from '../../binding/models/BindingDeactivation';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';

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
