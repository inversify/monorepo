import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { WarriorsDeleteStreamController } from '../controllers/WarriorsDeleteStreamController.js';
import { WarriorsGetStreamController } from '../controllers/WarriorsGetStreamController.js';
import { WarriorsOptionsStreamController } from '../controllers/WarriorsOptionsStreamController.js';
import { WarriorsPatchStreamController } from '../controllers/WarriorsPatchStreamController.js';
import { WarriorsPostStreamController } from '../controllers/WarriorsPostStreamController.js';
import { WarriorsPutStreamController } from '../controllers/WarriorsPutStreamController.js';

function getMethodWarriorStreamController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteStreamController;
    case HttpMethod.get:
      return WarriorsGetStreamController;
    case HttpMethod.options:
      return WarriorsOptionsStreamController;
    case HttpMethod.patch:
      return WarriorsPatchStreamController;
    case HttpMethod.post:
      return WarriorsPostStreamController;
    case HttpMethod.put:
      return WarriorsPutStreamController;
  }
}

function givenWarriorStreamControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorStreamController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller that return a stream for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStreamControllerForContainer.bind(this)(httpMethod);
  },
);
