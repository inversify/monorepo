import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsThrowErrorController } from '../controllers/WarriorsThrowErrorController';
import { WarriorsThrowErrorOptionsController } from '../controllers/WarriorsThrowErrorOptionsController';
import { NotImplementedOperationErrorFilter } from '../error-filters/NotImplementedOperationErrorFilter';

function getMethodWarriorControllerWithErrorFilter(
  method: HttpMethod,
): NewableFunction {
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

  const controller: NewableFunction =
    getMethodWarriorControllerWithErrorFilter(method);

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
