import { When } from '@cucumber/cucumber';
import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyWorld } from '../../common/models/InversifyWorld';
import { setContainerGetRequest } from '../actions/setContainerGetRequest';
import { getContainerOrFail } from '../calculations/getContainerOrFail';

function whenContainerGetsValueForService(
  this: InversifyWorld,
  serviceId: ServiceIdentifier,
  containerAlias?: string,
  valueAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const parsedValueAlias: string = valueAlias ?? defaultAlias;

  setContainerGetRequest.bind(this)(
    parsedValueAlias,
    getContainerOrFail.bind(this)(parsedContainerAlias).get(serviceId),
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
  'container gets a {string} value for service {string}',
  function (valueAlias: string, serviceId: string): void {
    whenContainerGetsValueForService.bind(this)(
      serviceId,
      undefined,
      valueAlias,
    );
  },
);
