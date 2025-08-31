import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteSuccessfulGuardController } from '../controllers/WarriorsDeleteSuccessfulGuardController';
import { WarriorsDeleteUnsuccessfulGuardController } from '../controllers/WarriorsDeleteUnsuccessfulGuardController';
import { WarriorsGetSuccessfulGuardController } from '../controllers/WarriorsGetSuccessfulGuardController';
import { WarriorsGetUnsuccessfulGuardController } from '../controllers/WarriorsGetUnsuccessfulGuardController';
import { WarriorsOptionsSuccessfulGuardController } from '../controllers/WarriorsOptionsSuccessfulGuardController';
import { WarriorsOptionsUnsuccessfulGuardController } from '../controllers/WarriorsOptionsUnsuccessfulGuardController';
import { WarriorsPatchSuccessfulGuardController } from '../controllers/WarriorsPatchSuccessfulGuardController';
import { WarriorsPatchUnsuccessfulGuardController } from '../controllers/WarriorsPatchUnsuccessfulGuardController';
import { WarriorsPostSuccessfulGuardController } from '../controllers/WarriorsPostSuccessfulGuardController';
import { WarriorsPostUnsuccessfulGuardController } from '../controllers/WarriorsPostUnsuccessfulGuardController';
import { WarriorsPutSuccessfulGuardController } from '../controllers/WarriorsPutSuccessfulGuardController';
import { WarriorsPutUnsuccessfulGuardController } from '../controllers/WarriorsPutUnsuccessfulGuardController';
import { SuccessfulGuard } from '../guards/SuccessfulGuard';
import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard';

function getMethodWarriorSuccessfulGuardController(
  method: HttpMethod,
): NewableFunction {
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
): NewableFunction {
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

  const controller: NewableFunction =
    getMethodWarriorSuccessfulGuardController(method);

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

  const controller: NewableFunction =
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
