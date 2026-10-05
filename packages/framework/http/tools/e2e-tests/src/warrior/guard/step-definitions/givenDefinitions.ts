import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { WarriorsDeleteSuccessfulGuardController } from '../controllers/WarriorsDeleteSuccessfulGuardController.js';
import { WarriorsDeleteUnsuccessfulGuardController } from '../controllers/WarriorsDeleteUnsuccessfulGuardController.js';
import { WarriorsGetSuccessfulGuardController } from '../controllers/WarriorsGetSuccessfulGuardController.js';
import { WarriorsGetUnsuccessfulGuardController } from '../controllers/WarriorsGetUnsuccessfulGuardController.js';
import { WarriorsOptionsSuccessfulGuardController } from '../controllers/WarriorsOptionsSuccessfulGuardController.js';
import { WarriorsOptionsUnsuccessfulGuardController } from '../controllers/WarriorsOptionsUnsuccessfulGuardController.js';
import { WarriorsPatchSuccessfulGuardController } from '../controllers/WarriorsPatchSuccessfulGuardController.js';
import { WarriorsPatchUnsuccessfulGuardController } from '../controllers/WarriorsPatchUnsuccessfulGuardController.js';
import { WarriorsPostSuccessfulGuardController } from '../controllers/WarriorsPostSuccessfulGuardController.js';
import { WarriorsPostUnsuccessfulGuardController } from '../controllers/WarriorsPostUnsuccessfulGuardController.js';
import { WarriorsPutSuccessfulGuardController } from '../controllers/WarriorsPutSuccessfulGuardController.js';
import { WarriorsPutUnsuccessfulGuardController } from '../controllers/WarriorsPutUnsuccessfulGuardController.js';
import { SuccessfulGuard } from '../guards/SuccessfulGuard.js';
import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard.js';

function getMethodWarriorSuccessfulGuardController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteSuccessfulGuardController;
    case HttpMethod.get:
      return WarriorsGetSuccessfulGuardController;
    case HttpMethod.options:
      return WarriorsOptionsSuccessfulGuardController;
    case HttpMethod.patch:
      return WarriorsPatchSuccessfulGuardController;
    case HttpMethod.post:
      return WarriorsPostSuccessfulGuardController;
    case HttpMethod.put:
      return WarriorsPutSuccessfulGuardController;
  }
}

function getMethodWarriorUnsuccessfulGuardController(
  method: HttpMethod,
): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUnsuccessfulGuardController;
    case HttpMethod.get:
      return WarriorsGetUnsuccessfulGuardController;
    case HttpMethod.options:
      return WarriorsOptionsUnsuccessfulGuardController;
    case HttpMethod.patch:
      return WarriorsPatchUnsuccessfulGuardController;
    case HttpMethod.post:
      return WarriorsPostUnsuccessfulGuardController;
    case HttpMethod.put:
      return WarriorsPutUnsuccessfulGuardController;
  }
}

function givenWarriorSuccessfulGuardControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorSuccessfulGuardController(method);

  container.bind(SuccessfulGuard).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorUnsuccessfulGuardControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable =
    getMethodWarriorUnsuccessfulGuardController(method);

  container.bind(UnsuccessfulGuard).toSelf().inSingletonScope();
  container.bind(controller).toSelf().inSingletonScope();
}

Given<InversifyHttpWorld>(
  'a warrior controller with SuccessfulGuard for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorSuccessfulGuardControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with UnsuccessfulGuard for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorUnsuccessfulGuardControllerForContainer.bind(this)(httpMethod);
  },
);
