import { type ServiceIdentifier } from '@inversifyjs/common';
import { type BindingIdentifier, type Container } from '@inversifyjs/container';

import { type BindingParameterKind } from './BindingParameterKind';

export interface BaseBindingParameter<TKind extends BindingParameterKind> {
  bind: (container: Container) => BindingIdentifier;
  kind: TKind;
  serviceIdentifier: ServiceIdentifier;
}
