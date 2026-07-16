import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type GetOptions } from './GetOptions.js';
import { type OptionalGetOptions } from './OptionalGetOptions.js';

export interface ResolutionContext {
  get<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
    options: OptionalGetOptions,
  ): TActivated | undefined;
  get<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
    options?: GetOptions,
  ): TActivated;

  getActivations<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ): Iterable<BindingActivation<TActivated>> | undefined;

  getAll<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
    options?: GetOptions,
  ): TActivated[];

  getAllAsync<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
    options?: GetOptions,
  ): Promise<TActivated[]>;

  getAsync<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
    options: OptionalGetOptions,
  ): Promise<TActivated | undefined>;
  getAsync<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
    options?: GetOptions,
  ): Promise<TActivated>;
}
