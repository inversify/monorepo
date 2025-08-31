import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteStatusCodeController } from '../controllers/WarriorsDeleteStatusCodeController';
import { WarriorsGetStatusCodeController } from '../controllers/WarriorsGetStatusCodeController';
import { WarriorsOptionsStatusCodeController } from '../controllers/WarriorsOptionsStatusCodeController';
import { WarriorsPatchStatusCodeController } from '../controllers/WarriorsPatchStatusCodeController';
import { WarriorsPostStatusCodeController } from '../controllers/WarriorsPostStatusCodeController';
import { WarriorsPutStatusCodeController } from '../controllers/WarriorsPutStatusCodeController';

function getMethodWarriorStatusCodeController(
  method: HttpMethod,
): NewableFunction {
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

  const controller: NewableFunction =
    getMethodWarriorStatusCodeController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with NO_CONTENT statusCode decorator for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStatusCodeControllerForContainer.bind(this)(httpMethod);
  },
);
