import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteHttpResponseController } from '../controllers/WarriorsDeleteHttpResponseController';
import { WarriorsGetHttpResponseController } from '../controllers/WarriorsGetHttpResponseController';
import { WarriorsOptionsHttpResponseController } from '../controllers/WarriorsOptionsHttpResponseController';
import { WarriorsPatchHttpResponseController } from '../controllers/WarriorsPatchHttpResponseController';
import { WarriorsPostHttpResponseController } from '../controllers/WarriorsPostHttpResponseController';
import { WarriorsPutHttpResponseController } from '../controllers/WarriorsPutHttpResponseController';

function getMethodWarriorStatusCodeController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteHttpResponseController;
    case HttpMethod.get:
      return WarriorsGetHttpResponseController;
    case HttpMethod.options:
      return WarriorsOptionsHttpResponseController;
    case HttpMethod.patch:
      return WarriorsPatchHttpResponseController;
    case HttpMethod.post:
      return WarriorsPostHttpResponseController;
    case HttpMethod.put:
      return WarriorsPutHttpResponseController;
  }
}

function givenWarriorHttpResponseControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorStatusCodeController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with route returning HttpResponse object for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorHttpResponseControllerForContainer.bind(this)(httpMethod);
  },
);
