import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { WarriorsDeleteHttpResponseController } from '../controllers/WarriorsDeleteHttpResponseController.js';
import { WarriorsGetHttpResponseController } from '../controllers/WarriorsGetHttpResponseController.js';
import { WarriorsOptionsHttpResponseController } from '../controllers/WarriorsOptionsHttpResponseController.js';
import { WarriorsPatchHttpResponseController } from '../controllers/WarriorsPatchHttpResponseController.js';
import { WarriorsPostHttpResponseController } from '../controllers/WarriorsPostHttpResponseController.js';
import { WarriorsPutHttpResponseController } from '../controllers/WarriorsPutHttpResponseController.js';

function getMethodWarriorStatusCodeController(method: HttpMethod): Newable {
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

  const controller: Newable = getMethodWarriorStatusCodeController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with route returning HttpResponse object for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorHttpResponseControllerForContainer.bind(this)(httpMethod);
  },
);
