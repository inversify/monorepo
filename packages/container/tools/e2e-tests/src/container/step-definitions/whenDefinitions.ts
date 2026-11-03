import { When } from '@cucumber/cucumber';
import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';
import { type GetAllOptions, type GetOptions } from '@inversifyjs/core';

import { defaultAlias } from '../../common/models/defaultAlias';
import { type InversifyWorld } from '../../common/models/InversifyWorld';
import { setContainerGetRequest } from '../actions/setContainerGetRequest';
import { getContainerOrFail } from '../calculations/getContainerOrFail';

function whenContainerGetsAllValuesForService(
  this: InversifyWorld,
  serviceId: ServiceIdentifier,
  options?: GetAllOptions,
  containerAlias?: string,
  valueAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const parsedValueAlias: string = valueAlias ?? defaultAlias;

  setContainerGetRequest.bind(this)(
    parsedValueAlias,
    getContainerOrFail
      .bind(this)(parsedContainerAlias)
      .getAll(serviceId, options),
  );
}

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
  '{string} container gets all values for service {string}',
  function (containerAlias: string, serviceId: string): void {
    whenContainerGetsAllValuesForService.bind(this)(
      serviceId,
      undefined,
      containerAlias,
    );
  },
);

When<InversifyWorld>(
  '{string} container gets all values in chained mode for service {string}',
  function (containerAlias: string, serviceId: string): void {
    whenContainerGetsAllValuesForService.bind(this)(
      serviceId,
      { chained: true },
      containerAlias,
    );
  },
);

When<InversifyWorld>(
  '{string} container gets a value for service {string}',
  function (containerAlias: string, serviceId: string): void {
    whenContainerGetsValueForService.bind(this)(
      serviceId,
      undefined,
      containerAlias,
    );
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
