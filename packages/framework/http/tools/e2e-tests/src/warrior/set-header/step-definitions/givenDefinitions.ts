import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { WarriorsDeleteSetHeaderController } from '../controllers/WarriorsDeleteSetHeaderController';
import { WarriorsDeleteSetHeaderWithStatusCodeController } from '../controllers/WarriorsDeleteSetHeaderWithStatusCodeController';
import { WarriorsGetSetHeaderController } from '../controllers/WarriorsGetSetHeaderController';
import { WarriorsGetSetHeaderWithStatusCodeController } from '../controllers/WarriorsGetSetHeaderWithStatusCodeController';
import { WarriorsOptionsSetHeaderController } from '../controllers/WarriorsOptionsSetHeaderController';
import { WarriorsOptionsSetHeaderWithStatusCodeController } from '../controllers/WarriorsOptionsSetHeaderWithStatusCodeController';
import { WarriorsPatchSetHeaderController } from '../controllers/WarriorsPatchSetHeaderController';
import { WarriorsPatchSetHeaderWithStatusCodeController } from '../controllers/WarriorsPatchSetHeaderWithStatusCodeController';
import { WarriorsPostSetHeaderController } from '../controllers/WarriorsPostSetHeaderController';
import { WarriorsPostSetHeaderWithStatusCodeController } from '../controllers/WarriorsPostSetHeaderWithStatusCodeController';
import { WarriorsPutSetHeaderController } from '../controllers/WarriorsPutSetHeaderController';
import { WarriorsPutSetHeaderWithStatusCodeController } from '../controllers/WarriorsPutSetHeaderWithStatusCodeController';

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

function getMethodWarriorSetHeaderWithStatusCodeController(
  method: HttpMethod,
): NewableFunction {
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

  const controller: NewableFunction =
    getMethodWarriorSetHeaderController(method);

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

  const controller: NewableFunction =
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
