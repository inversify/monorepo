import { When } from '@cucumber/cucumber';
import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import { GetOptions } from '@inversifyjs/core';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyWorld } from '../../common/models/InversifyWorld';
import { setContainerGetRequest } from '../actions/setContainerGetRequest';
import { getContainerOrFail } from '../calculations/getContainerOrFail';

function whenContainerGetsValueForService(
  this: InversifyWorld,
  serviceId: ServiceIdentifier,
  options?: GetOptions,
  containerAlias?: string,
  valueAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const parsedValueAlias: string = valueAlias ?? defaultAlias;

  setContainerGetRequest.bind(this)(
    parsedValueAlias,
    getContainerOrFail.bind(this)(parsedContainerAlias).get(serviceId, options),
  );
}

When<InversifyWorld>(
  'container gets a {warriorRelatedType} type value',
  function (warriorRelatedType: Newable): void {
    whenContainerGetsValueForService.bind(this)(warriorRelatedType);
  },
);

When<InversifyWorld>(
  'container gets a value for service {string}',
  function (serviceId: string): void {
    whenContainerGetsValueForService.bind(this)(serviceId);
  },
);

When<InversifyWorld>(
  'container gets a {warriorRelatedType} type value with autobind mode',
  function (serviceId: Newable): void {
    whenContainerGetsValueForService.bind(this)(serviceId, { autobind: true });
  },
);

When<InversifyWorld>(
  'container gets a {string} value for service {string}',
  function (valueAlias: string, serviceId: string): void {
    whenContainerGetsValueForService.bind(this)(
      serviceId,
      undefined,
      undefined,
      valueAlias,
    );
  },
);

When<InversifyWorld>('container takes a snapshot', function (): void {
  getContainerOrFail.bind(this)(defaultAlias).snapshot();
});

When<InversifyWorld>('container restores the last snapshot', function (): void {
  getContainerOrFail.bind(this)(defaultAlias).restore();
});
