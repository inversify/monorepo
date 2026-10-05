import { Given } from '@cucumber/cucumber';
import { Container, Newable } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias.js';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld.js';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail.js';
import { HttpMethod } from '../../../http/models/HttpMethod.js';
import { setServerRequest } from '../../../server/actions/setServerRequest.js';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail.js';
import { Server } from '../../../server/models/Server.js';
import { ServerKind } from '../../../server/models/ServerKind.js';
import { WarriorsDeleteJsonBodyController } from '../controllers/WarriorsDeleteJsonBodyController.js';
import { WarriorsDeleteJsonBodyNamedController } from '../controllers/WarriorsDeleteJsonBodyNamedController.js';
import { WarriorsDeleteMultipartBodyExpressController } from '../controllers/WarriorsDeleteMultipartBodyExpressController.js';
import { WarriorsDeleteMultipartBodyExpressV4Controller } from '../controllers/WarriorsDeleteMultipartBodyExpressV4Controller.js';
import { WarriorsDeleteMultipartBodyFastifyController } from '../controllers/WarriorsDeleteMultipartBodyFastifyController.js';
import { WarriorsDeleteMultipartBodyHonoController } from '../controllers/WarriorsDeleteMultipartBodyHonoController.js';
import { WarriorsDeleteMultipartBodyUwebSocketsController } from '../controllers/WarriorsDeleteMultipartBodyUwebSocketsController.js';
import { WarriorsDeleteStringBodyController } from '../controllers/WarriorsDeleteStringBodyController.js';
import { WarriorsDeleteUrlEncodedBodyController } from '../controllers/WarriorsDeleteUrlEncodedBodyController.js';
import { WarriorsOptionsJsonBodyController } from '../controllers/WarriorsOptionsJsonBodyController.js';
import { WarriorsOptionsJsonBodyNamedController } from '../controllers/WarriorsOptionsJsonBodyNamedController.js';
import { WarriorsOptionsMultipartBodyExpressController } from '../controllers/WarriorsOptionsMultipartBodyExpressController.js';
import { WarriorsOptionsMultipartBodyExpressV4Controller } from '../controllers/WarriorsOptionsMultipartBodyExpressV4Controller.js';
import { WarriorsOptionsMultipartBodyFastifyController } from '../controllers/WarriorsOptionsMultipartBodyFastifyController.js';
import { WarriorsOptionsMultipartBodyHonoController } from '../controllers/WarriorsOptionsMultipartBodyHonoController.js';
import { WarriorsOptionsMultipartBodyUwebSocketsController } from '../controllers/WarriorsOptionsMultipartBodyUwebSocketsController.js';
import { WarriorsOptionsStringBodyController } from '../controllers/WarriorsOptionsStringBodyController.js';
import { WarriorsOptionsUrlEncodedBodyController } from '../controllers/WarriorsOptionsUrlEncodedBodyController.js';
import { WarriorsPatchJsonBodyController } from '../controllers/WarriorsPatchJsonBodyController.js';
import { WarriorsPatchJsonBodyNamedController } from '../controllers/WarriorsPatchJsonBodyNamedController.js';
import { WarriorsPatchMultipartBodyExpressController } from '../controllers/WarriorsPatchMultipartBodyExpressController.js';
import { WarriorsPatchMultipartBodyExpressV4Controller } from '../controllers/WarriorsPatchMultipartBodyExpressV4Controller.js';
import { WarriorsPatchMultipartBodyFastifyController } from '../controllers/WarriorsPatchMultipartBodyFastifyController.js';
import { WarriorsPatchMultipartBodyHonoController } from '../controllers/WarriorsPatchMultipartBodyHonoController.js';
import { WarriorsPatchMultipartBodyUwebSocketsController } from '../controllers/WarriorsPatchMultipartBodyUwebSocketsController.js';
import { WarriorsPatchStringBodyController } from '../controllers/WarriorsPatchStringBodyController.js';
import { WarriorsPatchUrlEncodedBodyController } from '../controllers/WarriorsPatchUrlEncodedBodyController.js';
import { WarriorsPostJsonBodyController } from '../controllers/WarriorsPostJsonBodyController.js';
import { WarriorsPostJsonBodyNamedController } from '../controllers/WarriorsPostJsonBodyNamedController.js';
import { WarriorsPostMultipartBodyExpressController } from '../controllers/WarriorsPostMultipartBodyExpressController.js';
import { WarriorsPostMultipartBodyExpressV4Controller } from '../controllers/WarriorsPostMultipartBodyExpressV4Controller.js';
import { WarriorsPostMultipartBodyFastifyController } from '../controllers/WarriorsPostMultipartBodyFastifyController.js';
import { WarriorsPostMultipartBodyHonoController } from '../controllers/WarriorsPostMultipartBodyHonoController.js';
import { WarriorsPostMultipartBodyUwebSocketsController } from '../controllers/WarriorsPostMultipartBodyUwebSocketsController.js';
import { WarriorsPostStringBodyController } from '../controllers/WarriorsPostStringBodyController.js';
import { WarriorsPostUrlEncodedBodyController } from '../controllers/WarriorsPostUrlEncodedBodyController.js';
import { WarriorsPutJsonBodyController } from '../controllers/WarriorsPutJsonBodyController.js';
import { WarriorsPutJsonBodyNamedController } from '../controllers/WarriorsPutJsonBodyNamedController.js';
import { WarriorsPutMultipartBodyExpressController } from '../controllers/WarriorsPutMultipartBodyExpressController.js';
import { WarriorsPutMultipartBodyExpressV4Controller } from '../controllers/WarriorsPutMultipartBodyExpressV4Controller.js';
import { WarriorsPutMultipartBodyFastifyController } from '../controllers/WarriorsPutMultipartBodyFastifyController.js';
import { WarriorsPutMultipartBodyHonoController } from '../controllers/WarriorsPutMultipartBodyHonoController.js';
import { WarriorsPutMultipartBodyUwebSocketsController } from '../controllers/WarriorsPutMultipartBodyUwebSocketsController.js';
import { WarriorsPutStringBodyController } from '../controllers/WarriorsPutStringBodyController.js';
import { WarriorsPutUrlEncodedBodyController } from '../controllers/WarriorsPutUrlEncodedBodyController.js';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType.js';
import { WarriorRequest } from '../models/WarriorRequest.js';

function getMethodWarriorJsonBodyController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteJsonBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsJsonBodyController;
    case HttpMethod.patch:
      return WarriorsPatchJsonBodyController;
    case HttpMethod.post:
      return WarriorsPostJsonBodyController;
    case HttpMethod.put:
      return WarriorsPutJsonBodyController;
  }
}

function getMethodWarriorJsonBodyNamedController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteJsonBodyNamedController;
    case HttpMethod.get:
      throw new Error('Get not supported for body named controller');
    case HttpMethod.options:
      return WarriorsOptionsJsonBodyNamedController;
    case HttpMethod.patch:
      return WarriorsPatchJsonBodyNamedController;
    case HttpMethod.post:
      return WarriorsPostJsonBodyNamedController;
    case HttpMethod.put:
      return WarriorsPutJsonBodyNamedController;
  }
}

function getMethodWarriorStringBodyController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteStringBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsStringBodyController;
    case HttpMethod.patch:
      return WarriorsPatchStringBodyController;
    case HttpMethod.post:
      return WarriorsPostStringBodyController;
    case HttpMethod.put:
      return WarriorsPutStringBodyController;
  }
}

function getMethodWarriorUrlEncodedBodyController(method: HttpMethod): Newable {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUrlEncodedBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsUrlEncodedBodyController;
    case HttpMethod.patch:
      return WarriorsPatchUrlEncodedBodyController;
    case HttpMethod.post:
      return WarriorsPostUrlEncodedBodyController;
    case HttpMethod.put:
      return WarriorsPutUrlEncodedBodyController;
  }
}

function getMethodWarriorMultipartBodyController(
  method: HttpMethod,
  serverKind: ServerKind,
): Newable {
  switch (serverKind) {
    case ServerKind.express: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyExpressController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyExpressController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyExpressController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyExpressController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyExpressController;
      }
      // The inner switch always returns or throws, so this is unreachable
      // but satisfies the linter
      break;
    }
    case ServerKind.express4: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyExpressV4Controller;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyExpressV4Controller;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyExpressV4Controller;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyExpressV4Controller;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyExpressV4Controller;
      }
      break;
    }
    case ServerKind.fastify: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyFastifyController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyFastifyController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyFastifyController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyFastifyController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyFastifyController;
      }
      break;
    }
    case ServerKind.hono: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyHonoController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyHonoController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyHonoController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyHonoController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyHonoController;
      }
      break;
    }
    case ServerKind.uwebsockets: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyUwebSocketsController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyUwebSocketsController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyUwebSocketsController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyUwebSocketsController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyUwebSocketsController;
      }
      break;
    }
  }
}

function givenWarriorRequestWithEmptyStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    body: '',
    headers: {
      'Content-Type': 'text/plain',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: '',
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    body: 'string-body-content',
    headers: {
      'Content-Type': 'text/plain',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: 'string-body-content',
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithNoStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: undefined,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithJsonBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const requestInit: RequestInit = {
    body: JSON.stringify(warriorRequest),
    headers: {
      'Content-Type': 'application/json',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithUrlEncodedBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const urlEncodedBody: string = new URLSearchParams({
    name: warriorRequest.name,
    type: warriorRequest.type,
  }).toString();

  const requestInit: RequestInit = {
    body: urlEncodedBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorJsonBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorBodyNamedControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorJsonBodyNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorStringBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorStringBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorUrlEncodedBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorUrlEncodedBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorMultipartBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: Newable = getMethodWarriorMultipartBodyController(
    method,
    serverKind,
  );

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorRequestWithMultipartBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const formData: FormData = new FormData();
  formData.append('name', warriorRequest.name);
  formData.append('type', warriorRequest.type);

  const requestInit: RequestInit = {
    body: formData,
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

Given<InversifyHttpWorld>(
  'a warrior controller with body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with body decorator with parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorBodyNamedControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with string body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStringBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with empty string body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithEmptyStringBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with JSON body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithJsonBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with no body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithNoStringBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with string body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithStringBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with urlencoded body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorUrlEncodedBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with urlencoded body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithUrlEncodedBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with multipart body decorator without parameter name for "{httpMethod}" method for "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorMultipartBodyControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with multipart body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithMultipartBodyForServer.bind(this)(httpMethod);
  },
);
