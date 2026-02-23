import { type Newable } from 'inversify';

import { type BindingMetadata } from '../models/BindingMetadata.js';
import { type BindingMetadataMap } from '../models/BindingMetadataMap.js';

export function updateMetadataMap(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bindingMetadata: BindingMetadata<any>,
): (bindingMetadataMap: BindingMetadataMap) => BindingMetadataMap {
  return (bindingMetadataMap: BindingMetadataMap): BindingMetadataMap => {
    let targetBindingMetadata: BindingMetadata<unknown>[] | undefined =
      bindingMetadataMap.get(target as Newable<unknown>);

    if (targetBindingMetadata === undefined) {
      targetBindingMetadata = [];
      bindingMetadataMap.set(target as Newable<unknown>, targetBindingMetadata);
    }

    targetBindingMetadata.push(bindingMetadata);

    return bindingMetadataMap;
  };
}
