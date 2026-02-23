import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { bindingMetadataMapReflectKey } from '../../reflectMetadata/data/bindingMetadataMapReflectKey.js';
import { type BindingMetadataMap } from '../models/BindingMetadataMap.js';

export function buildProviderModule(): ContainerModule {
  return new ContainerModule((options: ContainerModuleLoadOptions): void => {
    const bindingMetadataMap: BindingMetadataMap | undefined =
      getReflectMetadata<BindingMetadataMap>(
        Object,
        bindingMetadataMapReflectKey,
      );

    if (bindingMetadataMap === undefined) {
      return;
    }

    for (const bindingMetadataList of bindingMetadataMap.values()) {
      for (const bindingMetadata of bindingMetadataList) {
        bindingMetadata.action(options.bind);
      }
    }
  });
}
