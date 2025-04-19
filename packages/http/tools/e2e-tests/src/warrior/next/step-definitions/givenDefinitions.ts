import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteNextController } from '../controllers/WarriorsDeleteNextController';
import { WarriorsGetNextController } from '../controllers/WarriorsGetNextController';
import { WarriorsOptionsNextController } from '../controllers/WarriorsOptionsNextController';
import { WarriorsPatchNextController } from '../controllers/WarriorsPatchNextController';
import { WarriorsPostNextController } from '../controllers/WarriorsPostNextController';
import { WarriorsPutNextController } from '../controllers/WarriorsPutNextController';

function getMethodWarriorNextController(method: HttpMethod): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteNextController;
    case HttpMethod.get:
      return WarriorsGetNextController;
    case HttpMethod.options:
      return WarriorsOptionsNextController;
    case HttpMethod.patch:
      return WarriorsPatchNextController;
    case HttpMethod.post:
      return WarriorsPostNextController;
    case HttpMethod.put:
      return WarriorsPutNextController;
  }
}

function givenWarriorNextControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction = getMethodWarriorNextController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with next decorator for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorNextControllerForContainer.bind(this)(httpMethod);
  },
);
