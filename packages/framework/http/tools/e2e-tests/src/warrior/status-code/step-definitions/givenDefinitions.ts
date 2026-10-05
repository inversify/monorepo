import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { WarriorsDeleteStatusCodeController } from '../controllers/WarriorsDeleteStatusCodeController.js';
import { WarriorsGetStatusCodeController } from '../controllers/WarriorsGetStatusCodeController.js';
import { WarriorsOptionsStatusCodeController } from '../controllers/WarriorsOptionsStatusCodeController.js';
import { WarriorsPatchStatusCodeController } from '../controllers/WarriorsPatchStatusCodeController.js';
import { WarriorsPostStatusCodeController } from '../controllers/WarriorsPostStatusCodeController.js';
import { WarriorsPutStatusCodeController } from '../controllers/WarriorsPutStatusCodeController.js';

function getMethodWarriorStatusCodeController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteStatusCodeController;
    case HttpMethod.get:
      return WarriorsGetStatusCodeController;
    case HttpMethod.options:
      return WarriorsOptionsStatusCodeController;
    case HttpMethod.patch:
      return WarriorsPatchStatusCodeController;
    case HttpMethod.post:
      return WarriorsPostStatusCodeController;
    case HttpMethod.put:
      return WarriorsPutStatusCodeController;
  }
}

function givenWarriorStatusCodeControllerForContainer(
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
  'a warrior controller with NO_CONTENT statusCode decorator for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStatusCodeControllerForContainer.bind(this)(httpMethod);
  },
);
