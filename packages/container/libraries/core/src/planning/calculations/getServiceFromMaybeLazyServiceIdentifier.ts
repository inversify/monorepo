import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

export function getServiceFromMaybeLazyServiceIdentifier<T>(
  serviceIdentifier: ServiceIdentifier<T> | LazyServiceIdentifier<T>,
): ServiceIdentifier<T> {
  return LazyServiceIdentifier.is(serviceIdentifier)
    ? serviceIdentifier.unwrap()
    : serviceIdentifier;
}
