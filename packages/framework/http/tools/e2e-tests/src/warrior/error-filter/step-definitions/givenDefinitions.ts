import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { WarriorsThrowErrorController } from '../controllers/WarriorsThrowErrorController.js';
import { WarriorsThrowErrorOptionsController } from '../controllers/WarriorsThrowErrorOptionsController.js';
import { NotImplementedOperationErrorFilter } from '../error-filters/NotImplementedOperationErrorFilter.js';

function getMethodWarriorControllerWithErrorFilter(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
    case HttpMethod.get:
    case HttpMethod.post:
    case HttpMethod.patch:
    case HttpMethod.put:
      return WarriorsThrowErrorController;
    case HttpMethod.options:
      return WarriorsThrowErrorOptionsController;
  }
}

function givenWarriorControllerWithErrorFilterForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorControllerWithErrorFilter(method);

  container
    .bind(NotImplementedOperationErrorFilter)
    .toSelf()
    .inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with ErrorFilter for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorControllerWithErrorFilterForContainer.bind(this)(httpMethod);
  },
);
