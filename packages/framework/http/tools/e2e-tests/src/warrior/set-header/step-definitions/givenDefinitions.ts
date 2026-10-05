import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { WarriorsDeleteSetHeaderController } from '../controllers/WarriorsDeleteSetHeaderController.js';
import { WarriorsDeleteSetHeaderWithStatusCodeController } from '../controllers/WarriorsDeleteSetHeaderWithStatusCodeController.js';
import { WarriorsGetSetHeaderController } from '../controllers/WarriorsGetSetHeaderController.js';
import { WarriorsGetSetHeaderWithStatusCodeController } from '../controllers/WarriorsGetSetHeaderWithStatusCodeController.js';
import { WarriorsOptionsSetHeaderController } from '../controllers/WarriorsOptionsSetHeaderController.js';
import { WarriorsOptionsSetHeaderWithStatusCodeController } from '../controllers/WarriorsOptionsSetHeaderWithStatusCodeController.js';
import { WarriorsPatchSetHeaderController } from '../controllers/WarriorsPatchSetHeaderController.js';
import { WarriorsPatchSetHeaderWithStatusCodeController } from '../controllers/WarriorsPatchSetHeaderWithStatusCodeController.js';
import { WarriorsPostSetHeaderController } from '../controllers/WarriorsPostSetHeaderController.js';
import { WarriorsPostSetHeaderWithStatusCodeController } from '../controllers/WarriorsPostSetHeaderWithStatusCodeController.js';
import { WarriorsPutSetHeaderController } from '../controllers/WarriorsPutSetHeaderController.js';
import { WarriorsPutSetHeaderWithStatusCodeController } from '../controllers/WarriorsPutSetHeaderWithStatusCodeController.js';

function getMethodWarriorSetHeaderController(method: HttpMethod): Newable {
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

function getMethodWarriorSetHeaderWithStatusCodeController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSetHeaderWithStatusCodeController;
    case HttpMethod.get:
      return WarriorsGetSetHeaderWithStatusCodeController;
    case HttpMethod.options:
      return WarriorsOptionsSetHeaderWithStatusCodeController;
    case HttpMethod.patch:
      return WarriorsPatchSetHeaderWithStatusCodeController;
    case HttpMethod.post:
      return WarriorsPostSetHeaderWithStatusCodeController;
    case HttpMethod.put:
      return WarriorsPutSetHeaderWithStatusCodeController;
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

  const controller: Newable = getMethodWarriorSetHeaderController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorSetHeaderWithStatusCodeControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable =
    getMethodWarriorSetHeaderWithStatusCodeController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with setHeader decorator for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorSetHeaderControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with both setHeader and statusCode decorators for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorSetHeaderWithStatusCodeControllerForContainer.bind(this)(
      httpMethod,
    );
  },
);
