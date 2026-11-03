import { type IWorld } from '@cucumber/cucumber';
import { type Container } from '@inversifyjs/container';

import { type BindingIdentifierParameter } from '../../binding/models/BindingIdentifierParameter';
import { type BindingParameter } from '../../binding/models/BindingParameter';

interface EntitiesMap {
  bindingIdentifiers: Map<string, BindingIdentifierParameter>;
  bindings: Map<string, BindingParameter>;
  containers: Map<string, Container>;
}

interface ContainerRequests {
  get: Map<string, unknown>;
}

export interface InversifyWorld extends IWorld {
  readonly containerRequests: ContainerRequests;
  readonly entities: EntitiesMap;
}
