import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteStreamController } from '../controllers/WarriorsDeleteStreamController';
import { WarriorsGetStreamController } from '../controllers/WarriorsGetStreamController';
import { WarriorsOptionsStreamController } from '../controllers/WarriorsOptionsStreamController';
import { WarriorsPatchStreamController } from '../controllers/WarriorsPatchStreamController';
import { WarriorsPostStreamController } from '../controllers/WarriorsPostStreamController';
import { WarriorsPutStreamController } from '../controllers/WarriorsPutStreamController';

function getMethodWarriorStreamController(method: HttpMethod): NewableFunction {
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

  const controller: NewableFunction = getMethodWarriorStreamController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller that return a stream for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStreamControllerForContainer.bind(this)(httpMethod);
  },
);
