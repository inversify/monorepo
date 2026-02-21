import { type BindingScope } from '@inversifyjs/core';

import { type Container } from '../services/Container.js';

export interface ContainerOptions {
  autobind?: true;
  defaultScope?: BindingScope | undefined;
  parent?: Container | undefined;
}
