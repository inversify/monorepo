import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteSetHeaderController } from '../controllers/WarriorsDeleteSetHeaderController';
import { WarriorsGetSetHeaderController } from '../controllers/WarriorsGetSetHeaderController';
import { WarriorsOptionsSetHeaderController } from '../controllers/WarriorsOptionsSetHeaderController';
import { WarriorsPatchSetHeaderController } from '../controllers/WarriorsPatchSetHeaderController';
import { WarriorsPostSetHeaderController } from '../controllers/WarriorsPostSetHeaderController';
import { WarriorsPutSetHeaderController } from '../controllers/WarriorsPutSetHeaderController';

function getMethodWarriorSetHeaderController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSetHeaderController;
    case HttpMethod.get:
      return WarriorsGetSetHeaderController;
    case HttpMethod.options:
      return WarriorsOptionsSetHeaderController;
    case HttpMethod.patch:
      return WarriorsPatchSetHeaderController;
    case HttpMethod.post:
      return WarriorsPostSetHeaderController;
    case HttpMethod.put:
      return WarriorsPutSetHeaderController;
  }
}

function givenWarriorSetHeaderControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorSetHeaderController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with setHeader decorator for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorSetHeaderControllerForContainer.bind(this)(httpMethod);
  },
);
